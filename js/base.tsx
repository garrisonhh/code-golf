import { $, $$ } from './_util';
import dialogPolyfill from 'dialog-polyfill';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Add current time zone to the redirect URI of any log in links.
for (const a of $$<HTMLAnchorElement>('.log-in')) {
    const url = new URL(a.href);

    // Assume a redirect is already present
    const redirect = new URL(url.searchParams.get('redirect_uri') as string);
    redirect.searchParams.set('time_zone', timeZone);
    url.searchParams.set('redirect_uri', redirect.href);

    a.href = url.href;
}

// Wire up the config button, if present.
$('#configBtn')?.addEventListener('click', () => {
    $<HTMLFormElement>('#form-config')?.reset();

    // Dialog typings are not available yet
    $<any>('dialog').showModal();
});

// Wire up mobile form navigation.
$('#form-nav')?.addEventListener('change',
    (e: Event) => location.href =
        [
            ...new FormData((e.target as HTMLFormElement).form).values(),
        ].filter((v: string | FormDataEntryValue) => v).join('/'));

// Add suggestions to any input with a list.
for (const input of $$<any>('[list]')) {
    let controller: AbortController | undefined;

    input.oninput = async () => {
        controller?.abort();        // Abort the old request (if exists).
        input.list.innerHTML = '';  // Clear current suggestions.

        if (input.value != '')
            input.list.append(...(await (await fetch(
                `/api/suggestions/${input.list.id}?` +
                    new URLSearchParams({ ...input.dataset, q: input.value }),
                { signal: (controller = new AbortController()).signal },
            )).json()).map((suggestion: string) => <option value={suggestion}/>));
    };
}

for (const dialog of $$<HTMLDialogElement>('dialog')) {
    dialogPolyfill.registerDialog(dialog);

    dialog.onclick = (e: MouseEvent) => e.target == dialog ? (dialog as any).close() : null;
}
