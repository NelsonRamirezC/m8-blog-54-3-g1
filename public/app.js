const API = "/api";

const token = () => localStorage.getItem("token");
const authHeaders = (json = true) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
});

async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            ...authHeaders(options.body instanceof FormData ? false : true),
            ...(options.headers || {}),
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
        throw new Error(data.message || "No se pudo completar la solicitud.");
    return data;
}

function decodeToken() {
    try {
        return JSON.parse(
            atob(token().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
    } catch {
        return null;
    }
}

function formatDate(value) {
    return value
        ? new Date(value).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "Sin fecha";
}
function escapeHtml(value = "") {
    return String(value).replace(
        /[&<>'"]/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            })[character],
    );
}
function showMessage(message, type = "danger") {
    const box = document.querySelector("[data-message]");
    if (box) {
        box.className = `alert alert-${type}`;
        box.textContent = message;
        box.hidden = false;
    }
}

function renderNav() {
    const nav = document.querySelector("[data-nav]");
    if (!nav) return;
    nav.innerHTML = `<nav class="navbar navbar-expand-lg" data-bs-theme="dark"><div class="container"><a class="navbar-brand fw-bold" href="index.html">M8 Blog</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNav"><div class="navbar-nav ms-auto align-items-lg-center"><a class="nav-link" href="index.html">Publicaciones</a>${token() ? '<a class="nav-link" href="nueva-publicacion.html">Nueva publicación</a><a class="nav-link" href="perfil.html">Mi perfil</a><button class="btn btn-sm btn-outline-light ms-lg-3 mt-2 mt-lg-0" data-logout>Cerrar sesión</button>' : '<a class="nav-link" href="login.html">Iniciar sesión</a><a class="nav-link" href="registro.html">Registro</a>'}</div></div></div></nav>`;
    nav.querySelector("[data-logout]")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        location.href = "index.html";
    });
}

function requireAuth() {
    if (!token()) {
        location.href = "login.html";
        return false;
    }
    return true;
}
document.addEventListener("DOMContentLoaded", renderNav);
