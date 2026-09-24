param(
    [string]$Root = (Resolve-Path ".").Path
)

$required = @(
    "index/index.html",
    "index/css/main.css",
    "index/js/app.js",
    "index/js/config.js",
    "index/js/version.js",
    "services/storage.js",
    "services/cache.js",
    "services/ecosystem.js",
    "services/i18n.js",
    "index/service-worker.js",
    "config/cambric.config.json",
    "cambric.manifest.json"
)

$failed = 0

foreach ($file in $required) {
    if (Test-Path $file) {
        Write-Host "PASS $file" -ForegroundColor Green
    } else {
        Write-Host "FAIL $file" -ForegroundColor Red
        $failed++
    }
}

& "./scripts/doctor.ps1"
if (-not $?) {
    $failed++
}

& "./security/secret-scan.ps1"
if (-not $?) {
    $failed++
}

if ($failed -gt 0) {
    Write-Host "WEB TEMPLATE TESTS FAILED: $failed" -ForegroundColor Red
    exit 1
}

Write-Host "WEB TEMPLATE TESTS PASSED." -ForegroundColor Green
