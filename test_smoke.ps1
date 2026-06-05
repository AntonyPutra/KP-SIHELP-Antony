$ErrorActionPreference = "Stop"

Write-Host "1. Testing Login..."
$login = Invoke-RestMethod -Uri http://localhost:8000/api/login -Method Post -Body '{"email":"admin@sihelp.local","password":"admin123"}' -ContentType "application/json"
$token = $login.data.token
Write-Host "Login successful. Token acquired."

Write-Host "`n2. Testing Profile..."
$profile = Invoke-RestMethod -Uri http://localhost:8000/api/profile -Method Get -Headers @{Authorization="Bearer $token"}
Write-Host "Profile name: $($profile.data.name)"

Write-Host "`n3. Testing Users..."
$users = Invoke-RestMethod -Uri http://localhost:8000/api/users -Method Get -Headers @{Authorization="Bearer $token"}
Write-Host "Total users: $($users.data.length)"

Write-Host "`n4. Testing Category Creation..."
$category = Invoke-RestMethod -Uri http://localhost:8000/api/categories -Method Post -Body '{"name":"Software"}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
Write-Host "Category created: $($category.data.name)"

Write-Host "`n5. Testing Ticket Creation..."
$ticket = Invoke-RestMethod -Uri http://localhost:8000/api/tickets -Method Post -Body '{"title":"Error Aplikasi","description":"Aplikasi tidak bisa dibuka","priority":"Tinggi","category_id":1}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
Write-Host "Ticket created: $($ticket.data.title)"

Write-Host "`n6. Testing Ticket Status Update..."
$status = Invoke-RestMethod -Uri http://localhost:8000/api/tickets/1/status -Method Patch -Body '{"status":"Diproses"}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
Write-Host "Ticket status updated to: $($status.data.status)"

Write-Host "`n7. Testing Ticket Comment..."
$comment = Invoke-RestMethod -Uri http://localhost:8000/api/tickets/1/comments -Method Post -Body '{"comment":"Akan segera kami tangani."}' -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
Write-Host "Comment added: $($comment.data.comment)"

Write-Host "`n8. Testing Audit Logs..."
$logs = Invoke-RestMethod -Uri http://localhost:8000/api/audit-logs -Method Get -Headers @{Authorization="Bearer $token"}
Write-Host "Total audit logs: $($logs.data.length)"

Write-Host "`nAll tests completed successfully!"
