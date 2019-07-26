$path = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
$path = ($path.Split(';') | Where-Object { $_ -ne "$PSScriptRoot\bin-win" }) -join ';'
$path = $path, "$PSScriptRoot\bin-win" -join ';'
[Environment]::SetEnvironmentVariable('PATH', $path, 'User')
