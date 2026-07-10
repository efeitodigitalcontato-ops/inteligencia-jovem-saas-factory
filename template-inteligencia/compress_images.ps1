Add-Type -AssemblyName System.Drawing

$publicDir = "c:\Users\Randerson\.gemini\antigravity\scratch\inteligencia-jovem-novo\public"
$blogDir = "c:\Users\Randerson\.gemini\antigravity\scratch\inteligencia-jovem-novo\src\content\blog"

# Encoder parameter for quality
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80) # 80% quality

$replacements = @{}

Write-Host "Buscando imagens grandes em public/ para otimização..."

if (-not (Test-Path $publicDir)) {
    Write-Host "Diretório public não existe."
    exit
}

$files = Get-ChildItem -Path $publicDir -Recurse -File | Where-Object { $_.Extension -match "\.(png|jpg|jpeg)$" -and $_.Length -gt 150kb }

Write-Host "Encontradas $($files.Count) imagens com mais de 150KB."

foreach ($file in $files) {
    $srcPath = $file.FullName
    $ext = $file.Extension.ToLower()
    $tempPath = $srcPath + ".tmp.jpg"
    
    try {
        # Load image
        $bmp = New-Object System.Drawing.Bitmap($srcPath)
        
        # Save as JPEG with compression to temp path
        $bmp.Save($tempPath, $jpegEncoder, $encoderParams)
        $bmp.Dispose()
        
        # Se era PNG, deletar o original e renomear o temporário para .jpg
        if ($ext -eq ".png") {
            $destPath = $srcPath.Substring(0, $srcPath.Length - $ext.Length) + ".jpg"
            if (Test-Path $destPath) {
                Remove-Item -Path $destPath -Force
            }
            Remove-Item -Path $srcPath -Force
            Rename-Item -Path $tempPath -NewName ($file.BaseName + ".jpg")
            
            # Registrar substituição para caminhos relativos
            $relSrc = "/" + $srcPath.Replace($publicDir + "\", "").Replace("\", "/")
            $relDest = "/" + $destPath.Replace($publicDir + "\", "").Replace("\", "/")
            $replacements[$relSrc] = $relDest
            Write-Host "Convertido PNG para JPG compactado: $($file.Name)"
        } else {
            # Se era JPG grande, deletar original e renomear temporário por cima
            Remove-Item -Path $srcPath -Force
            Rename-Item -Path $tempPath -NewName $file.Name
            Write-Host "Compactado JPG: $($file.Name)"
        }
    }
    catch {
        if (Test-Path $tempPath) {
            Remove-Item -Path $tempPath -Force
        }
        Write-Host "Erro ao processar $($file.Name): $_"
    }
}

# Atualizar referências nos posts markdown
if ($replacements.Count -gt 0 -and (Test-Path $blogDir)) {
    Write-Host "Atualizando referências nos posts markdown..."
    $mdFiles = Get-ChildItem -Path $blogDir -Filter "*.md"
    
    $replacedCount = 0
    foreach ($md in $mdFiles) {
        $content = Get-Content -Path $md.FullName -Raw
        $modified = $false
        
        foreach ($key in $replacements.Keys) {
            if ($content.Contains($key)) {
                $content = $content.Replace($key, $replacements[$key])
                $modified = $true
            }
        }
        
        if ($modified) {
            Set-Content -Path $md.FullName -Value $content -Encoding utf8
            $replacedCount++
        }
    }
    Write-Host "Concluído! $replacedCount arquivos markdown atualizados."
}
