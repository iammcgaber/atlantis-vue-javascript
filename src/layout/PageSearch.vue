<script setup>
import { usePageSearch } from '@/search/usePageSearch';
import { onClickOutside, onKeyStroke, useTimeoutFn } from '@vueuse/core';
import { shallowRef, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

// Atlantis's expanding search (an icon button that opens into a field), as a fuzzy page search
// (Fuse.js): typing "dark mode" or "pasword" finds the matching settings page.
// `variant` picks the topbar (desktop) or breadcrumb (mobile) styles.
const props = defineProps({
    variant: { type: String, default: 'topbar' }
});

const router = useRouter();
const { query, results } = usePageSearch();
const selected = shallowRef(null);
const active = shallowRef(false);
const root = useTemplateRef('root');
const input = useTemplateRef('input');

// The field is `visibility: hidden` until its opening transition starts, so focus it a moment later.
const { start: focusSoon } = useTimeoutFn(() => input.value?.$el.querySelector('input')?.focus(), 100, { immediate: false });

function open() {
    active.value = true;
    focusSoon();
}

function close() {
    active.value = false;
    selected.value = null;
}

function goToPage({ value }) {
    router.push({ name: value.name });
    close();
}

// The suggestions overlay is appended to <body>, so clicks in it don't count as outside.
onClickOutside(root, close, { ignore: ['.p-autocomplete-overlay'] });
onKeyStroke('Escape', () => active.value && close());
</script>

<template>
    <div ref="root" :class="[`${props.variant}-search`, { [`${props.variant}-search-active`]: active }, props.variant === 'breadcrumb' && 'flex justify-end']">
        <Button icon="pi pi-search" :class="`${props.variant}-searchbutton text-surface-500 dark:text-surface-400 flex-shrink-0`" severity="secondary" text rounded type="button" :aria-label="$t('topbar.searchPages')" @click="open" />
        <div class="search-input-wrapper">
            <AutoComplete
                ref="input"
                v-model="selected"
                :suggestions="results"
                optionLabel="title"
                :placeholder="$t('topbar.search')"
                :ariaLabel="$t('topbar.searchPages')"
                :delay="100"
                autoOptionFocus
                :emptySearchMessage="$t('topbar.noMatches')"
                @complete="query = $event.query"
                @option-select="goToPage"
            >
                <template #option="{ option }">
                    <div class="flex items-center gap-2">
                        <i :class="option.icon" class="text-surface-500 dark:text-surface-400"></i>
                        <span>{{ option.title }}</span>
                    </div>
                </template>
            </AutoComplete>
        </div>
    </div>
</template>
