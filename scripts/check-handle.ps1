# Check what process is holding the Prisma engine DLL
Get-Process -Name node | ForEach-Object {
    try {
        $handles = $_.MainModule.FileName
    } catch { $handles = "N/A" }
    [PSCustomObject]@{
        Id = $_.Id
        WS_MB = [math]::Round($_.WorkingSet64 / 1MB, 1)
        Path = $_.Path
        CommandLine = ""
    }
} | Format-Table -AutoSize
