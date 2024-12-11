// Fetch and display complaints
async function fetchComplaints() {
  try {
      const response = await fetch('http://localhost:4000/api/complaints');
      if (!response.ok) {
          throw new Error('Failed to fetch complaints');
      }

      const complaints = await response.json();
      displayComplaints(complaints);
  } catch (error) {
      console.error('Error fetching complaints:', error);
  }
}

// Function to add complaints to the DOM
function displayComplaints(complaints) {
  const container = document.querySelector('.complaints-container');
  container.innerHTML = ''; // Clear previous complaints

  complaints.forEach((complaint) => {
      const complaintDiv = document.createElement('div');
      complaintDiv.className = 'complaint-item';
      complaintDiv.innerHTML = `
          <div class="complaint-summary">
              <img src="http://localhost:4000${complaint.imageUrl}" alt="Complaint Image">
          </div>
          <div class="complaint-details">
              <p><strong>Upload Date:</strong> ${new Date(complaint.date).toLocaleDateString()}</p>
              <p><strong>Address:</strong> ${complaint.address}</p>
              <p><strong>Description:</strong> ${complaint.description}</p>
              <p><strong>Status:</strong> ${complaint.status || 'Pending'}</p>
              <p><strong>Resolution Date:</strong> ${
                  complaint.resolutionDate ? new Date(complaint.resolutionDate).toLocaleDateString() : 'Not Set'
              }</p>
          </div>
          <div class="actions">
              <select class="status-dropdown" data-id="${complaint._id}">
                  <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Accepted" ${complaint.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                  <option value="Rejected" ${complaint.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
              </select>
              <input type="date" class="resolution-date-picker" data-id="${complaint._id}" value="${
                  complaint.resolutionDate ? new Date(complaint.resolutionDate).toISOString().split('T')[0] : ''
              }">
              <button class="save-btn" data-id="${complaint._id}">Save</button>
              <button class="delete-btn" data-id="${complaint._id}">Delete</button>
          </div>
      `;

      container.appendChild(complaintDiv);

        // Add event listener for Save button
        const saveButton = complaintDiv.querySelector('.save-btn');
        saveButton.addEventListener('click', () => {
            const status = complaintDiv.querySelector('.status-dropdown').value;
            const resolutionDate = complaintDiv.querySelector('.resolution-date-picker').value;

            updateComplaint(complaint._id, status, resolutionDate);
        });

        // Add event listener for Delete button
        const deleteButton = complaintDiv.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            deleteComplaint(complaint._id);
        });
    });
}

// async function fetchComplaints() {
//   try {
//       const response = await fetch('http://localhost:4000/api/complaints');
//       if (!response.ok) {
//           throw new Error('Failed to fetch complaints');
//       }

//       const complaints = await response.json();
//       displayComplaints(complaints);
//   } catch (error) {
//       console.error('Error fetching complaints:', error);
//   }
// }

// Listen for real-time updates


// Function to delete a complaint
async function deleteComplaint(complaintId) {
  console.log('Deleting Complaint ID:', complaintId);

  try {
      const response = await fetch(`http://localhost:4000/api/complaints/${complaintId}`, {
          method: 'DELETE',
      });

      if (!response.ok) {
          throw new Error('Failed to delete complaint');
      }

      // Remove complaint from DOM
      document.querySelector(`.delete-btn[data-id="${complaintId}"]`).closest('.complaint-item').remove();

      // Notify other connected clients about the deletion
      socket.emit('complaintDeleted', { id: complaintId });
  } catch (error) {
      console.error('Error deleting complaint:', error);
  }
}

// Function to update complaint status and resolution date
async function updateComplaint(id, status, resolutionDate) {
  console.log('Updating Complaint ID:', id); // Debugging log
  console.log('New Status:', status, 'Resolution Date:', resolutionDate); // Debugging log

  try {
      const response = await fetch(`http://localhost:4000/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, resolutionDate }),
      });

      if (!response.ok) {
          throw new Error('Failed to update complaint');
      }

      const updatedComplaint = await response.json();
      console.log('Complaint updated successfully:', updatedComplaint);

      // Optionally refresh the complaints or reflect changes dynamically
      fetchComplaints();
  } catch (error) {
      console.error('Error updating complaint:', error);
  }
}


const socket = io('http://localhost:4000');
socket.on('newComplaint', (complaint) => {
    fetchComplaints(); // Refresh complaints
});
// Real-time delete updates
socket.on('complaintDeleted', ({ id }) => {
  const complaintDiv = document.querySelector(`.delete-btn[data-id="${id}"]`);
  if (complaintDiv) {
      complaintDiv.closest('.complaint-item').remove();
  }
});

socket.on('updateComplaint', (updatedComplaint) => {
    fetchComplaints(); // Refresh complaints to show updated status
});

// Fetch complaints on page load
fetchComplaints();