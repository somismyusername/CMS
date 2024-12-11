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
          </div>
          <button class="delete-btn" data-id="${complaint._id}">Delete</button>
      `;

      // Add delete functionality
      const deleteButton = complaintDiv.querySelector('.delete-btn');
      deleteButton.addEventListener('click', () => deleteComplaint(complaint._id));

      container.appendChild(complaintDiv);
  });
}
async function deleteComplaint(complaintId) {
  console.log('Deleting Complaint ID:', complaintId); // Log the ID being sent

  try {
      const response = await fetch(`http://localhost:4000/api/complaints/${complaintId}`, {
          method: 'DELETE',
      });

      if (!response.ok) {
          throw new Error('Failed to delete complaint');
      }

      // Remove complaint from DOM
      document.querySelector(`.delete-btn[data-id="${complaintId}"]`).closest('.complaint-item').remove();

      socket.emit('complaintDeleted', { id: complaintId });
  } catch (error) {
      console.error('Error deleting complaint:', error);
  }
}

// Real-time updates using Socket.IO
const socket = io('http://localhost:4000');
socket.on('newComplaint', (complaint) => {
  const complaintElement = document.createElement('div');
  complaintElement.className = 'complaint';
  complaintElement.innerHTML = `
      <h3>${complaint.title}</h3>
      <p>${complaint.description}</p>
      <button onclick="openComplaintModal(${JSON.stringify(complaint)})">View Details</button>
  `;
  document.querySelector('.complaints-container').appendChild(complaintElement);
});
socket.on('complaintDeleted', ({ id }) => {
  const complaintDiv = document.querySelector(`.delete-btn[data-id="${id}"]`);
  if (complaintDiv) {
      complaintDiv.closest('.complaint-item').remove();
  }
});

// Fetch complaints on page load
fetchComplaints();
