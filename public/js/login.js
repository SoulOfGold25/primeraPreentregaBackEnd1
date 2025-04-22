const form = document.getElementById('loginForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);

    fetch('/api/sessions/login', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(result => {
        if (result.status === 200) {
            result.json().then(json => {
                console.log("Respuesta del login:", json);
                console.log("Cookies:", document.cookie);
                alert("Login realizado con éxito!");
            });

            // Redirigir al perfil del usuario
            window.location.replace('/');
        } else if (result.status === 401) {
            alert("Login inválido. Revisa tus credenciales.");
        } else {
            alert("Error inesperado al intentar loguearse.");
        }
    }).catch(err => {
        console.error("Error al procesar el login:", err);
        alert("Error de red o servidor.");
    });
});
