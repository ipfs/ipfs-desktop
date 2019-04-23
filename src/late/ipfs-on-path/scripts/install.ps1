$path = [Environment]::GetEnvironmentVariable('PATH', 'User'), "$PSScriptRoot\bin-win" -join ';'
[Environment]::SetEnvironmentVariable('PATH', $path, 'User')
