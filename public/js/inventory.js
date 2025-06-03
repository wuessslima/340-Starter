'use strict'

// Event listener for classification select
document.querySelector("#classificationList")?.addEventListener("change", function() {
  const classification_id = this.value
  console.log(`classification_id is: ${classification_id}`)
  const classIdURL = "/inv/getInventory/"+classification_id
  
  fetch(classIdURL)
  .then(function(response) {
    if (response.ok) {
      return response.json()
    }
    throw Error("Network response was not OK")
  })
  .then(function(data) {
    console.log(data)
    buildInventoryList(data)
  })
  .catch(function(error) {
    console.log('There was a problem: ', error.message)
  })
})

// Build inventory items into HTML table
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay")
  
  // Set up table structure
  let dataTable = '<table class="inventory-table">'
  dataTable += '<thead><tr><th>Vehicle Name</th><th>Action</th><th>Action</th></tr></thead>'
  dataTable += '<tbody>'
  
  // Add each inventory item as a row
  data.forEach(function(element) {
    dataTable += `<tr>
      <td>${element.inv_make} ${element.inv_model}</td>
      <td><a href='/inv/edit/${element.inv_id}' class='btn-modify'>Modify</a></td>
      <td><a href='/inv/delete/${element.inv_id}' class='btn-delete'>Delete</a></td>
    </tr>`
  })
  
  dataTable += '</tbody></table>'
  inventoryDisplay.innerHTML = dataTable
}