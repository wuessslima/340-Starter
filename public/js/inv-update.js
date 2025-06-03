'use strict'

// Enable update button when form changes
const form = document.querySelector("#updateForm")
form?.addEventListener("change", function() {
  const updateBtn = document.querySelector("#updateBtn")
  updateBtn?.removeAttribute("disabled")
})

// Optional: Disable button if no changes detected
form?.addEventListener("input", function() {
  const updateBtn = document.querySelector("#updateBtn")
  const formData = new FormData(form)
  let hasChanges = false
  
  // Check each field for changes
  formData.forEach((value, key) => {
    if (key !== "inv_id" && value !== form.dataset[key]) {
      hasChanges = true
    }
  })
  
  updateBtn.disabled = !hasChanges
})

// Store initial form values on load
document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("#updateForm")
  const formData = new FormData(form)
  
  formData.forEach((value, key) => {
    form.dataset[key] = value
  })
})