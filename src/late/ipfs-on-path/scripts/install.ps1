$path = "$([Environment]::GetEnvironmentVariable('PATH', 'User'));/$PSScriptRoot/bin-win"
echo $path
# [Environment]::SetEnvironmentVariable('PATH', $path, 'User')
