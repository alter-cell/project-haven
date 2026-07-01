import { getUser } from "./services/authService.js";
import { createProfile, getMyProfile, searchPetalId, updateProfile } from "./services/profileService.js";

export const accountModule = {
  title: "Account",
  description: "Create your secret identity"
};

let view;
let host;
let currentProfile = null;
let currentUser = null;

function ensureView() {
  if (view) return view;

  host = document.getElementById("secretOverlay");
  if (!host) return null;

  view = document.createElement("div");
  view.className = "account-view hidden";
  view.setAttribute("aria-live", "polite");
  view.innerHTML = `
    <div class="account-card">
      <div class="account-card__header">
        <div>
          <p class="eyebrow">Secret space</p>
          <h3>Create Your Identity</h3>
        </div>
        <button class="account-back" type="button" data-account-action="back">← Back</button>
      </div>
      <div class="account-card__body"></div>
    </div>
  `;

  host.appendChild(view);
  view.querySelector("[data-account-action='back']").addEventListener("click", () => {
    hideAccountScreen();
  });

  return view;
}

function showBody(message, type = "info") {
  const body = view?.querySelector(".account-card__body");
  if (!body) return;
  body.innerHTML = `
    <div class="account-message account-message--${type}">${message}</div>
  `;
}

function renderLoadingState() {
  const body = view?.querySelector(".account-card__body");
  if (!body) return;
  body.innerHTML = `
    <div class="account-loading">
      <span class="account-loading__dot"></span>
      <span class="account-loading__dot"></span>
      <span class="account-loading__dot"></span>
    </div>
  `;
}

function renderProfileView(profile) {
  const body = view?.querySelector(".account-card__body");
  if (!body) return;

  const initial = (profile?.display_name || "P").trim().charAt(0).toUpperCase();
  body.innerHTML = `
    <div class="account-profile">
      <div class="account-avatar" aria-hidden="true">${initial}</div>
      <div class="account-profile__meta">
        <h4>${profile?.display_name || "Your Name"}</h4>
        <p class="account-id">${profile?.petal_id || "petal-id"}</p>
      </div>
      <button class="reader-nav primary account-edit" type="button" data-account-action="edit">Edit</button>
    </div>
  `;

  body.querySelector("[data-account-action='edit']").addEventListener("click", () => renderFormView(profile));
}

function renderFormView(profile = null) {
  const body = view?.querySelector(".account-card__body");
  if (!body) return;

  const heading = profile ? "Update your identity" : "Create Your Identity";
  body.innerHTML = `
    <form class="account-form">
      <p class="account-copy">A warm little signature for your hidden room.</p>
      <label class="account-field">
        <span>Display Name</span>
        <input name="displayName" type="text" maxlength="40" value="${profile?.display_name || ""}" placeholder="How should you appear?" required />
      </label>
      <label class="account-field">
        <span>Petal ID</span>
        <input name="petalId" type="text" maxlength="24" value="${profile?.petal_id || ""}" placeholder="e.g. petal-rose" required />
      </label>
      <p class="account-message" id="accountMessage" aria-live="polite"></p>
      <div class="account-actions">
        <button class="reader-nav" type="button" data-account-action="cancel">Cancel</button>
        <button class="reader-nav primary" type="submit">Save</button>
      </div>
    </form>
  `;

  const form = body.querySelector(".account-form");
  const message = body.querySelector("#accountMessage");
  const cancelButton = body.querySelector("[data-account-action='cancel']");

  cancelButton?.addEventListener("click", () => {
    if (profile) {
      renderProfileView(profile);
    } else {
      showBody("Your secret identity is waiting.");
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const displayName = form.displayName.value.trim();
    const petalId = form.petalId.value.trim().toLowerCase();

    if (!displayName || !petalId) {
      message.textContent = "Please fill in both fields.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
    message.textContent = "";

    try {
      if (profile && profile.petal_id !== petalId) {
        const { data: existingProfile, error: lookupError } = await searchPetalId(petalId);
        if (lookupError) {
          throw lookupError;
        }
        if (existingProfile) {
          message.textContent = "That Petal ID is already taken.";
          submitButton.disabled = false;
          submitButton.textContent = "Save";
          return;
        }
      }

      const now = new Date().toISOString();
      const payload = {
        display_name: displayName,
        petal_id: petalId,
        created_at: profile?.created_at || now
      };

      if (profile) {
        const { error } = await updateProfile(currentUser.id, payload);
        if (error) throw error;
        currentProfile = { ...profile, ...payload };
      } else {
        const { error } = await createProfile({
          id: currentUser.id,
          display_name: displayName,
          petal_id: petalId,
          created_at: now
        });
        if (error) throw error;
        currentProfile = { id: currentUser.id, ...payload };
      }

      renderProfileView(currentProfile);
    } catch (error) {
      message.textContent = error?.message || "We could not save your identity right now.";
      submitButton.disabled = false;
      submitButton.textContent = "Save";
    }
  });
}

export async function openAccountScreen() {
  const element = ensureView();
  if (!element) return;

  element.classList.remove("hidden");
  renderLoadingState();

  try {
    const user = await getUser();
    currentUser = user;
    if (!user) {
      showBody("Please sign in to create your identity.", "warning");
      return;
    }

    const { data, error } = await getMyProfile(user.id);
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      currentProfile = data;
      renderProfileView(data);
    } else {
      currentProfile = null;
      renderFormView();
    }
  } catch (error) {
    showBody(error?.message || "We could not load your account.", "warning");
  }
}

export function hideAccountScreen() {
  if (!view) return;
  view.classList.add("hidden");
}

export function initializeAccountModule() {
  ensureView();
  return {
    open: openAccountScreen,
    close: hideAccountScreen
  };
}
