const socket = io('http://localhost:4000');

// Get DOM elements
const complaintList = document.querySelector('.complaints-container'); // Corrected to match DOM
const addComplaintBtn = document.getElementById('addComplaintBtn');
const addComplaintModal = document.getElementById('add-complaint-modal');
const complaintForm = document.getElementById('newComplaintForm');
const closeAddComplaintBtn = document.querySelector('.close-add-complaint');

// Open the modal when clicking the button
addComplaintBtn.onclick = () => {
    addComplaintModal.style.display = 'block';
};

// Close the modal when clicking the close button
closeAddComplaintBtn.onclick = () => {
    addComplaintModal.style.display = 'none';
};

// Handle form submission
complaintForm.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(complaintForm);

    try {
        const response = await fetch('http://localhost:4000/api/complaints', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to submit complaint');
        }

        const newComplaint = await response.json();
        addComplaintToList(newComplaint);
        complaintForm.reset();
        addComplaintModal.style.display = 'none';
    } catch (error) {
        console.error('Error submitting complaint:', error);
    }
};

// Add a complaint to the list dynamically
function addComplaintToList(complaint) {
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
    `;
    document.querySelector('.complaints-container').appendChild(complaintDiv);

    
  // Create modal content dynamically
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
          <button class="close-btn">&times;</button>
          <img src="http://localhost:4000${complaint.imageUrl}" alt="Complaint Image">
          <div class="complaint-details">
              <p><strong>Upload Date:</strong> ${new Date(complaint.date).toLocaleDateString()}</p>
              <p><strong>Address:</strong> ${complaint.address}</p>
              <p><strong>Description:</strong> ${complaint.description}</p>
          </div>
      </div>
  `;

  // Add event listeners for opening and closing modal
  const image = complaintDiv.querySelector('.complaint-summary img');
  const closeButton = modal.querySelector('.close-btn');

  image.onclick = () => {
      document.body.appendChild(modal); // Append modal to the body
      modal.style.display = 'flex'; // Show the modal
      document.body.classList.add('modal-active'); // Add blur effect
  };

  closeButton.onclick = () => {
      modal.style.display = 'none'; // Hide the modal
      document.body.classList.remove('modal-active'); // Remove blur effect
      document.body.removeChild(modal); // Remove modal from the DOM
  };

  complaintList.appendChild(complaintDiv);
}




// Fetch and display complaints on page load
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

function displayComplaints(complaints) {
    complaintList.innerHTML = ''; // Clear previous complaints
    complaints.forEach((complaint) => {
        addComplaintToList(complaint);
    });
}

// Fetch complaints on page load
fetchComplaints();
socket.on('complaintDeleted', ({ id }) => {
  const complaintDiv = document.querySelector(`.delete-btn[data-id="${id}"]`);
  if (complaintDiv) {
      complaintDiv.closest('.complaint-item').remove();
  }
});

// Real-time updates via Socket.IO
socket.on('newComplaint', (complaint) => {
    addComplaintToList(complaint);
    console.log('New complaint received:', complaint);
});
