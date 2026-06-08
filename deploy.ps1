# deploy.ps1 — загрузка файлов на po.dfprod.ru
$keyPath  = "$env:USERPROFILE\.ssh\dfprod_dev"
$server   = "dev@176.12.66.250"
$remote   = "/home/dev/projects/po-board/public/"
$local    = $PSScriptRoot

Write-Host "Деплой на po.dfprod.ru..."

# Корневые файлы
$files = @("plan_timeline.html", "plan_timeline.js", "plan_timeline.css", "data.json", "index.html")
foreach ($f in $files) {
    $path = Join-Path $local $f
    if (Test-Path $path) {
        scp -i $keyPath -o StrictHostKeyChecking=no "$path" "${server}:${remote}"
        Write-Host "  $f"
    }
}

# Директории
foreach ($d in @("config", "js", "css")) {
    $path = Join-Path $local $d
    if (Test-Path $path) {
        scp -i $keyPath -o StrictHostKeyChecking=no -r "$path" "${server}:${remote}"
        Write-Host "  $d/"
    }
}

Write-Host "Готово. Сайт: https://po.dfprod.ru"
