param(
    [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$requiredFiles = @(
    "config/cambric.config.json",
    "cambric.manifest.json",
    "index/index.html",
    "index/css/main.css",
    "index/js/app.js",
    "index/js/config.js",
    "services\storage.js",
    "services\cache.js",
    "services\release.js",
    "services\ecosystem.js",
    "services\i18n.js",
    "services\version.js",
    "security\security.js",
    "index/service-worker.js"
)

$problems = @()

foreach ($relative in $requiredFiles) {
    $fullPath = Join-Path $Root $relative
    if (-not (Test-Path $fullPath)) {
        $problems += "MISSING: $relative"
    }
}

$configPath = Join-Path $Root "config/cambric.config.json"
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        if (-not $config.product.id) { $problems += "config/cambric.config.json is missing product.id" }
        if (-not $config.product.version) { $problems += "config/cambric.config.json is missing product.version" }
    } catch {
        $problems += "config/cambric.config.json is invalid JSON"
    }
}

$manifestPath = Join-Path $Root "cambric.manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        if (-not $manifest.productId) { $problems += "cambric.manifest.json is missing productId" }
        if (-not $manifest.version) { $problems += "cambric.manifest.json is missing version" }
    } catch {
        $problems += "cambric.manifest.json is invalid JSON"
    }
}

if ($problems.Count -gt 0) {
    foreach ($problem in $problems) {
        Write-Host $problem -ForegroundColor Red
    }
    exit 1
}

Write-Host "Cambric web doctor passed." -ForegroundColor Green
