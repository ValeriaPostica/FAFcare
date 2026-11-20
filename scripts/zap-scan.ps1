# save as .\scripts\zap-scan.ps1
param(
    [ValidateSet("baseline", "full")]
    [string]$Mode = "baseline"
)

$ErrorActionPreference = "Stop"
$reportsPath = Join-Path (Get-Location) "reports"
$scriptsPath = Join-Path (Get-Location) "scripts"
New-Item -ItemType Directory -Force -Path $reportsPath | Out-Null

# Copy ignore config to reports directory so Docker can access it
$configFile = Join-Path $scriptsPath "zap-baseline-config.conf"
if (Test-Path $configFile) {
    Copy-Item $configFile -Destination (Join-Path $reportsPath "zap-baseline-config.conf") -Force
}

$zapScript = if ($Mode -eq "full") {
    "zap-full-scan.py"
} else {
    "zap-baseline.py"
}

# Run ZAP scan using the ignore config file (-c)
docker run --rm `
    -v "${reportsPath}:/zap/wrk:rw" `
    ghcr.io/zaproxy/zaproxy:stable `
    $zapScript `
    -t "http://host.docker.internal:5000" `
    -c "/zap/wrk/zap-baseline-config.conf" `
    -g "/zap/wrk/gen.conf" `
    -r "/zap/wrk/zap_report.html"

if ($LASTEXITCODE -ne 0) {
    throw "ZAP scan failed with exit code $LASTEXITCODE. Report conversion was skipped."
}

Write-Host "Fixing report table layout for PDF conversion..." -ForegroundColor Cyan

$reportFile = Join-Path $reportsPath "zap_report.html"
$reportHtml = Get-Content -Raw -Path $reportFile
$reportHtml = $reportHtml.Replace(
    '<table class="summary100">',
    '<table class="summary100 insights" style="table-layout: fixed;">'
)
$reportHtml = $reportHtml.Replace(
    '<th height="24">Level</th>',
    '<th width="8%" height="24">Level</th>'
)
$reportHtml = $reportHtml.Replace(
    '<th>Reason</th>',
    '<th width="14%">Reason</th>'
)
$reportHtml = $reportHtml.Replace(
    '<th>Site</th>',
    '<th width="23%">Site</th>'
)
$reportHtml = $reportHtml.Replace(
    '<th>Description</th>',
    '<th width="40%">Description</th>'
)
$reportHtml = $reportHtml.Replace(
    '<th>Statistic</th>',
    '<th width="15%">Statistic</th>'
)
$reportHtml = $reportHtml.Replace(
    'http://host.docker.internal:5000</div>',
    'http://host.<br />docker.internal:<br />5000</div>'
)
Set-Content -Path $reportFile -Value $reportHtml -Encoding utf8

Write-Host "Converting HTML report to PDF..." -ForegroundColor Cyan

if (Get-Command pandoc -ErrorAction SilentlyContinue) {
    pandoc `
        (Join-Path $reportsPath "zap_report.html") `
        -o (Join-Path $reportsPath "zap_report.pdf") `
        --pdf-engine=xelatex `
        -V geometry:margin=0.75in `
        -V variable=subparagraph `
        --variable urlcolor=blue `
        --toc-depth=2 `
        --pdf-engine-opt=-halt-on-error `
        --pdf-engine-opt=-interaction=batchmode `
        --wrap=preserve
} else {
    docker run --rm `
        -v "${reportsPath}:/data:rw" `
        pandoc/extra:latest `
        /data/zap_report.html `
        -o /data/zap_report.pdf `
        --pdf-engine=xelatex `
        -V geometry:margin=0.75in `
        -V variable=subparagraph `
        --variable urlcolor=blue `
        --toc-depth=2 `
        --pdf-engine-opt=-halt-on-error `
        --pdf-engine-opt=-interaction=batchmode `
        --wrap=preserve
}

Write-Host "Reports created in: $reportsPath" -ForegroundColor Green