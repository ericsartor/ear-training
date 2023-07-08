<script setup lang="ts">

const emit = defineEmits<{
    (e: 'close'): void
}>();

const props = defineProps<{
    width?: string // CSS value
    height?:  string // CSS value
    left?: string // CSS value
    top?: string // CSS value
    contentPadding?: string // CSS value
    title?: string
    noClose?: boolean
    noHeader?: boolean
    noFooter?: boolean
    centerContent?: boolean
    fitContent?: boolean
}>();
const contentCenterValue = props.centerContent ? 'center' : 'flex-start';

// Set up grid rows
const gridValues = ['1fr'];
if (!props.noHeader) gridValues.unshift('24px');
if (!props.noFooter) gridValues.push('48px');
const gridValue = gridValues.join(' ');

// Event handlers
function handleBackgroundClick() {
    if (!props.noClose) emit('close');
}
function handleCloseButton() {
    if (!props.noClose) emit('close');
}

</script>

<template>

    <Teleport to="#modals">

        <div class="background" @click="handleBackgroundClick">
    
            <div
                class="modal"
                :style="{
                    width: fitContent ? 'unset' : width,
                    height: fitContent ? 'unset' : height,
                    left: left,
                    top: top,
                    position: left || top ? 'fixed' : undefined,
                    gridTemplateRows: gridValue,
                }"
                @click.stop
            >

                <header v-if="!noHeader">

                    <span class="title">{{ title }}</span>
                    <button v-if="!noClose" class="close" @click="handleCloseButton">X</button>

                </header>

                <main
                    :style="{
                        justifyContent: contentCenterValue,
                        alignItems: contentCenterValue,
                        padding: contentPadding
                    }"
                >

                    <slot></slot>

                </main>

                <footer v-if="!noFooter">

                    <slot name="footer">

                        <div class="default-footer">

                            <button class="footer-close">Close</button>

                        </div>

                    </slot>

                </footer>

            </div>
    
        </div>

    </Teleport>

</template>

<style scoped>
.background {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
}

.modal {
    display: grid;
    grid-template-columns: 1fr;
    width: 50vw;
    height: 50vh;
    background-color: white;
    border: 1px solid black;
}

.modal > header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid black;
    padding-left: 4px;
}

.modal > header > button.close {
    height: 100%;
    aspect-ratio: 1 / 1;
    border: none;
    border-left: 1px solid black;
}
.modal > header > button.close:hover {
    cursor: pointer;
}

.modal > main {
    display: flex;
}

.modal > footer {
    border-top: 1px solid black;
}

.modal > footer > .default-footer {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    height: 100%;
}
</style>