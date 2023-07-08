<script setup lang="ts">
import { FirebaseError } from '@firebase/util';
import { computed } from '@vue/reactivity';
import { getAuth, createUserWithEmailAndPassword, type User, signInWithEmailAndPassword } from 'firebase/auth';
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'registered', user: User): void
}>();

// Instantiate auth
const auth = getAuth();

// Form values
const email = ref('');
const password = ref('');

// E-mail validation
const emailIsValid = computed(() => {
    return /^[^@]+@[^@]/.test(email.value);
});

// Password validation
const passwordWarningMap = computed(() => {
    const LENGTH = 'Password must be at least 8 characters long.';
    const UPPER = 'Password must contain an uppercase letter.';
    const LOWER = 'Password must contain a lowercase letter.';
    const NUM = 'Password must contain a number.';
    const SPECIAL = 'Password must contain a non-word/number/space character.';
    
    // Map warnings to boolean that represents if the warning is satiated
    const warnings: Record<string, boolean> = {
        [LENGTH]: true,
        [UPPER]: true,
        [LOWER]: true,
        [NUM]: true,
        [SPECIAL]: true,
    };
    if (password.value.length < 8) warnings[LENGTH] = false;
    if (!/[A-Z]/.test(password.value)) warnings[UPPER] = false;
    if (!/[a-z]/.test(password.value)) warnings[LOWER] = false;
    if (!/[0-9]/.test(password.value)) warnings[NUM] = false;
    if (!/[^\w\s0-9]/.test(password.value)) warnings[SPECIAL] = false;
    
    return warnings;
});
const passwordWarnings = computed(() => {
    return Object.keys(passwordWarningMap.value);
});
const passwordIsStrong = computed(() => {
    return !Object.values(passwordWarningMap.value).includes(false);
});

// Submission
const hasSubmittedOnce = ref(false);
const submitting = ref(false);
const submitError = ref('');
const success = ref(false);
async function handleSubmit() {
    // Prevent dupe submissions
    if (submitting.value) return;

    // Track that user has tried to register, allows errors to be shown
    hasSubmittedOnce.value = true;

    // Abort if form isn't valid
    if (!emailIsValid.value) return;
    if (!passwordIsStrong.value) return;

    // Track that we are submitting the form
    submitting.value = true;
    
    try {
        const registrationUserCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        emit('registered', registrationUserCredential.user);
    } catch (e) {
        if (e instanceof FirebaseError) {
            switch (e.code) {
                case 'auth/email-already-in-use':
                    submitError.value = 'E-mail already in use.';
                    break;
                case 'auth/network-request-failed':
                    submitError.value = 'Could not connect to auth server.';
                    break;
                default:
                    submitError.value = 'Unknown registration error';
            }
        } else if (e instanceof Error) {
            submitError.value = e.message;
        } else {
            submitError.value = 'unknown error occured';
        }
    } finally {
        // Track that submitting has stopped
        submitting.value = false;
    }
}
</script>

<template>
    
    <div class="registration">
        
        <form
            @submit.prevent="handleSubmit"
            @invalid.prevent="handleSubmit"
        >

            <p v-if="submitError" class="error">{{ submitError }}</p>
            <p v-if="success" class="success">Success!</p>
        
            <div class="input-group">
                <label :class="{ invalid: hasSubmittedOnce && !emailIsValid }">
                    Email
                    <input type="email" v-model="email">
                </label>
            </div>
            
            <div class="input-group">
                
                <label :class="{ invalid: hasSubmittedOnce && !passwordIsStrong }">
                    Password
                    <input type="password" v-model="password">
                </label>
                
                <div v-if="hasSubmittedOnce && !passwordIsStrong" class="warnings">
                    <p
                        class="warning"
                        :class="{ satiated: passwordWarningMap[warning] }"
                        v-for="warning in passwordWarnings"
                        :key="warning"
                    >
                        {{ warning }}
                    </p>
                </div>
                
            </div>
            
            <button v-if="!submitting">Submit</button>
            
        </form>

    </div>

</template>

<style scoped>
form {
    display: flex;
    flex-flow: column nowrap;
    gap: 6px;
    align-items: center;
}
form > p.error {
    color: red;
}
form > p.success {
    color: green;
}
form .input-group {
    width: 100%;
}
form label {
    display: flex;
    justify-content: space-between;
}
form label.invalid input {
    border: 2px solid red;
}
.warnings {
    padding-left: 12px;
}
.warning {
    font-size: 0.8rem;
    color: red;
}
.warning.satiated {
    color: green;
}
</style>