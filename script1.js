
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
            // icon: "reminder-icon.png", // Optional: Provide a valid icon path
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
