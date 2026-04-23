
export function showToast(message, type = "success") {
    const backgroundColor = type === "success" 
        ? "var(--color-primary)"   
        : "var(--color-accent)";   

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: backgroundColor,
            color: "var(--color-surface)",       
            borderRadius: "var(--radius-sm)",    
            boxShadow: "var(--shadow-md)",       
            fontFamily: "var(--font-body)",      
            fontWeight: "500",
            padding: "12px 24px",
            border: "1px solid var(--color-border)" 
        }
    }).showToast();
}