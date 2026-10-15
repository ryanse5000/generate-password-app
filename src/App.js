import React, { useState } from 'react'
import './App.css';
import { numbers, upperCaseLetters, lowerCaseLetters, specialCharacters } from './Character'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { COPY_Fail, COPY_SUCCESS } from './message';
import { toastMessageSetting } from './ToastMessageSetting';

const MIN_LENGTH = 10
const MAX_LENGTH = 64

function App() {
  const [password, setPassword] = useState("")
  const [passwordLength, setPasswordLength] = useState(20)
  const [includeUpperCase, setIncludeUpperCase] = useState(true)
  const [includeLowerCase, setIncludeLowerCase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)

  const options = [
    { id: "uppercase-letters", label: "Uppercase letters", hint: "A–Z", checked: includeUpperCase, onChange: setIncludeUpperCase },
    { id: "lowercase-letters", label: "Lowercase letters", hint: "a–z", checked: includeLowerCase, onChange: setIncludeLowerCase },
    { id: "include-numbers", label: "Numbers", hint: "0–9", checked: includeNumbers, onChange: setIncludeNumbers },
    { id: "include-symbols", label: "Symbols", hint: "!@#$", checked: includeSymbols, onChange: setIncludeSymbols },
  ]

  const handleGeneratePassword = () => {
    if (!includeUpperCase && !includeLowerCase && !includeNumbers && !includeSymbols) {
      notify("To generate a password you must select at least one option", true)
    }
    else {
      let characterList = ""
      if (includeNumbers) {
        characterList = characterList + numbers
      }
      if (includeUpperCase) {
        characterList = characterList + upperCaseLetters
      }
      if (includeLowerCase) {
        characterList = characterList + lowerCaseLetters
      }
      if (includeSymbols) {
        characterList = characterList + specialCharacters
      }
      try {
        setPassword(createPassword(characterList));
        notify("Password generated successfully", false);
      }
      catch {
        notify("Failed to generate password", true);
      }
    }
  }

  const createPassword = (characterList) => {
    const randomValues = new Uint32Array(passwordLength)
    window.crypto.getRandomValues(randomValues)
    let password = ""
    for (let i = 0; i < passwordLength; i++) {
      password = password + characterList.charAt(randomValues[i] % characterList.length)
    }
    return password
  }

  const copyToClipboard = (password) => {
    return navigator.clipboard.writeText(password)
  }

  const notify = (message, hasError = false) => {
    toast.dismiss();

    if (hasError) {
      toast.error(message, toastMessageSetting);
    }
    else {
      toast.success(message, toastMessageSetting);
    }
  }

  const handleCopyPassword = () => {
    if (password === "") {
      notify(COPY_Fail, true)
    }
    else {
      copyToClipboard(password)
        .then(() => notify(COPY_SUCCESS))
        .catch(() => notify("Could not copy - your browser blocked clipboard access", true))
    }
  }

  const strength = getStrength(password)

  return (
    <div className="App">
      <main className="generator">
        <header className="generator__header">
          <span className="generator__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <div>
            <h1 className="generator__title">Password Generator</h1>
            <p className="generator__subtitle">Strong, random passwords in one click</p>
          </div>
        </header>

        <div className="generator__password">
          <output className={password ? "generator__value" : "generator__value generator__value--empty"} aria-live="polite">
            {password || "Your password will appear here"}
          </output>
          <button onClick={handleCopyPassword} className="copy__btn" type="button" aria-label="Copy to clipboard" title="Copy to clipboard">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
        </div>

        <div className={`strength strength--${strength.level}`}>
          <div className="strength__bars" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <span className="strength__label">{strength.label}</span>
        </div>

        <div className="length">
          <div className="length__row">
            <label htmlFor="password-length">Password length</label>
            <span className="length__value">{passwordLength}</span>
          </div>
          <input
            className="length__slider"
            value={passwordLength}
            onChange={(e) => setPasswordLength(Number(e.target.value))}
            type="range"
            id="password-length"
            name="password-length"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            style={{ "--fill": `${((passwordLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100}%` }}
          />
        </div>

        <div className="options">
          {options.map((option) => (
            <label className="option" htmlFor={option.id} key={option.id}>
              <span className="option__text">
                {option.label}
                <span className="option__hint">{option.hint}</span>
              </span>
              <input
                className="switch"
                checked={option.checked}
                onChange={(e) => option.onChange(e.target.checked)}
                type="checkbox"
                role="switch"
                id={option.id}
                name={option.id}
              />
            </label>
          ))}
        </div>

        <button onClick={handleGeneratePassword} className="generator__btn" type="button">
          Generate password
        </button>
      </main>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

function getStrength(password) {
  if (!password) {
    return { level: "none", label: "Not generated yet" }
  }
  const variety = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length
  const score = password.length >= 16 ? variety + 1 : variety
  if (score >= 4) return { level: "strong", label: "Strong" }
  if (score === 3) return { level: "good", label: "Good" }
  if (score === 2) return { level: "fair", label: "Fair" }
  return { level: "weak", label: "Weak" }
}

export default App;
