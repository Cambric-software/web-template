param(
    [string]$Root = (Get-Location).Path
)

$patterns = @(
    "sk-[A-Za-z0-9]{20,}",
    "AKIA[0-9A-Z]{16}",
    "BEGIN PRIVATE KEY",
    "password\s*[:=]",
    "secret\s*[:=]",
    "api[_-]?key\s*[:=]"
)

$extensions = @(
    "*.js",
    "*.json",
    "*.html",
    "*.css",
    "*.py",
    "*.dart",
    "*.yml",
    "*.yaml"
)

$matches = @()

foreach ($extension in $extensions) {
    Get-ChildItem -Path $Root -Filter $extension -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch "\\.git\\" -and
            $_.FullName -notmatch "\\node_modules\\"
        } |
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue

            foreach ($pattern in $patterns) {
                if ($content -match $pattern) {
                    $matches += $_.FullName
                    break
                }
            }
        }
}

if ($matches.Count -gt 0) {
    Write-Host "Potential secrets detected:" -ForegroundColor Red
    $matches | Sort-Object -Unique
    exit 1
}

Write-Host "Secret scan passed." -ForegroundColor Green
