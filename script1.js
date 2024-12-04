// // =====storage + notification==========
// // Load existing reminders from localStorage when the page loads
// let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

// // Request notification permission on page load
// if (Notification.permission !== 'granted') {
//     Notification.requestPermission();
// }

// // Function to set a new reminder
// document.getElementById('setReminderBtn').addEventListener('click', function() {
//     const reminderText = document.getElementById('reminderInput').value;
//     const frequency = parseInt(document.getElementById('frequencyInput').value) * 60000; // Convert to milliseconds

//     if (reminderText && frequency) {
//         const reminderId = new Date().getTime(); // Unique ID for the reminder
//         const lastTriggerTime = Date.now(); // Store the current time as the last trigger time
//         reminders.push({ id: reminderId, text: reminderText, frequency: frequency, lastTriggerTime: lastTriggerTime, timeout: null });

//         // Schedule the reminder with the calculated time
//         scheduleReminder(reminderId, reminderText, frequency, lastTriggerTime);

//         // Clear the input fields
//         document.getElementById('reminderInput').value = '';
//         document.getElementById('frequencyInput').value = '';
        
//         // Update the reminder list and save to localStorage
//         updateReminderList();
//         localStorage.setItem('reminders', JSON.stringify(reminders));
//     } else {
//         alert('Please enter a reminder and a frequency.');
//     }
// });

// // Function to schedule a reminder
// function scheduleReminder(id, text, frequency, lastTriggerTime) {
//     const reminderIndex = reminders.findIndex(reminder => reminder.id === id);
//     if (reminderIndex !== -1) {
//         const elapsedTime = Date.now() - lastTriggerTime; // Calculate time elapsed since the last trigger
//         const timeUntilNextReminder = frequency - (elapsedTime % frequency); // Calculate remaining time until next reminder

//         reminders[reminderIndex].timeout = setTimeout(() => {
//             // Display the notification if permission is granted
//             if (Notification.permission === 'granted') {
//                 new Notification('Reminder', {
//                     body: text,
//                     // icon: 'icon.png' // Optional: Add an icon for the notification
//                 });
//             }

//             // Trigger the reminder alert
//             // alert(text);
//             reminders[reminderIndex].lastTriggerTime = Date.now(); // Update last trigger time

//             // Schedule the next reminder
//             scheduleReminder(id, text, frequency, Date.now());
//         }, timeUntilNextReminder);
//     }
// }

// // Function to update the reminder list UI
// function updateReminderList() {
//     const reminderList = document.getElementById('reminderList');
//     reminderList.innerHTML = '';

//     reminders.forEach(reminder => {
//         const reminderDiv = document.createElement('div');
//         reminderDiv.classList.add('reminder');
//         reminderDiv.innerHTML = `
//             <span>${reminder.text} (every ${reminder.frequency / 60000} minutes)</span>
//             <button class="cancel-btn" onclick="cancelReminder(${reminder.id})">Cancel</button>
//         `;
//         reminderList.appendChild(reminderDiv);
//     });
// }

// // Function to cancel a reminder
// function cancelReminder(id) {
//     const reminderIndex = reminders.findIndex(reminder => reminder.id === id);
//     if (reminderIndex !== -1) {
//         clearTimeout(reminders[reminderIndex].timeout); // Clear the timeout
//         reminders.splice(reminderIndex, 1); // Remove the reminder from the array

//         // Update the displayed list and save changes to localStorage
//         updateReminderList();
//         localStorage.setItem('reminders', JSON.stringify(reminders));
//     }
// }

// // Initialize the reminder list on page load
// window.addEventListener('load', function() {
//     reminders.forEach(reminder => {
//         const elapsedTime = Date.now() - reminder.lastTriggerTime;
//         if (elapsedTime >= reminder.frequency) {
//             scheduleReminder(reminder.id, reminder.text, reminder.frequency, reminder.lastTriggerTime);
//         } else {
//             const timeUntilNextReminder = reminder.frequency - (elapsedTime % reminder.frequency);
//             setTimeout(() => {
//                 if (Notification.permission === 'granted') {
//                     new Notification('Reminder', {
//                         body: reminder.text,
//                         // icon: 'icon.png'
//                     });
//                 }
//                 // alert(reminder.text);
//                 reminder.lastTriggerTime = Date.now();
//                 scheduleReminder(reminder.id, reminder.text, reminder.frequency, Date.now());
//             }, timeUntilNextReminder);
//         }
//     });
//     updateReminderList();
// });

// ================ logic 2 =========================
// Load existing reminders from localStorage when the page loads
let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

// Request notification permission on page load
document.addEventListener("DOMContentLoaded", () => {
    if (Notification.permission === "default") {
        Notification.requestPermission()
            .then((permission) => {
                if (permission === "granted") {
                    console.log("Notifications enabled.");
                } else {
                    alert("Please enable notifications to get reminders.");
                }
            })
            .catch((err) => console.error("Notification permission error:", err));
    }
});

document.getElementById("setReminderBtn").addEventListener("click", function () {
    const reminderText = document.getElementById("reminderInput").value;
    const frequency = parseInt(document.getElementById("frequencyInput").value) * 60000; // Convert to milliseconds

    if (reminderText && frequency) {
        const reminderId = new Date().getTime(); // Unique ID for the reminder
        reminders.push({ id: reminderId, text: reminderText, frequency: frequency, lastTriggered: Date.now() });

        // Schedule the reminder
        scheduleReminder(reminderId, reminderText, frequency);

        // Clear the input fields
        document.getElementById("reminderInput").value = "";
        document.getElementById("frequencyInput").value = "";

        // Update the reminder list and save to localStorage
        updateReminderList();
        localStorage.setItem("reminders", JSON.stringify(reminders));
    } else {
        alert("Please enter a reminder and a frequency.");
    }
});

function scheduleReminder(id, text, frequency) {
    // Set an interval for each reminder
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
        reminder.interval = setInterval(() => {
            sendNotification(text);
            reminder.lastTriggered = Date.now();
            localStorage.setItem("reminders", JSON.stringify(reminders)); // Update lastTriggered in storage
        }, frequency);
    }
}

function sendNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Reminder", {
            body: message,
            icon: "reminder-icon.png", // Optional: Provide a valid icon path
        });
    } else {
        console.log("Notification permission denied.");
    }
}

function updateReminderList() {
    const reminderList = document.getElementById("reminderList");
    reminderList.innerHTML = "";

    reminders.forEach((reminder) => {
        const reminderDiv = document.createElement("div");
        reminderDiv.classList.add("reminder");
        reminderDiv.innerHTML = `
            <span>${reminder.text} (every ${reminder.frequency / 60000} minutes)</span>
            <button class="cancel-btn" onclick="cancelReminder(${reminder.id})">Cancel</button>
        `;
        reminderList.appendChild(reminderDiv);
    });
}

function cancelReminder(id) {
    const reminderIndex = reminders.findIndex((reminder) => reminder.id === id);
    if (reminderIndex !== -1) {
        clearInterval(reminders[reminderIndex].interval); // Clear the interval
        reminders.splice(reminderIndex, 1); // Remove the reminder from the array

        // Update the displayed list and save changes to localStorage
        updateReminderList();
        localStorage.setItem("reminders", JSON.stringify(reminders));
    }
}

// Reschedule reminders on page load
function restoreReminders() {
    reminders.forEach((reminder) => {
        const elapsed = Date.now() - reminder.lastTriggered;
        const nextTrigger = reminder.frequency - elapsed;

        // If the next trigger is in the past, show the notification immediately
        if (nextTrigger <= 0) {
            sendNotification(reminder.text);
            reminder.lastTriggered = Date.now();
        }

        // Schedule the reminder
        scheduleReminder(reminder.id, reminder.text, reminder.frequency);
    });
}

// Initialize the reminder list and restore reminders
window.addEventListener("load", () => {
    updateReminderList();
    restoreReminders();
});
