Get-Process -Name node | Select-Object Id, @{N='WS_MB'; E={ [math]::Round($_.WorkingSet64 / 1MB, 1) }}, StartTime, Path | Format-Table -AutoSize
