param(
  [string]$Token
)

$repoDir = "C:\Users\Arpita\.gemini\antigravity\scratch\voiceshield-india"
Set-Location $repoDir

if ($Token) {
  Write-Host "Pushing using provided GitHub Personal Access Token..." -ForegroundColor Cyan
  git push "https://$Token@github.com/chandreomkar/VoiceShield-AI.git" main
} else {
  Write-Host "Pushing to https://github.com/chandreomkar/VoiceShield-AI..." -ForegroundColor Cyan
  Write-Host "If prompted, enter your GitHub Username and Personal Access Token (or password)." -ForegroundColor Yellow
  git push origin main
}
