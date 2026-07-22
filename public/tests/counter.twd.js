import { twd, userEvent, screenDom } from 'twd-js';
import { describe, it } from 'twd-js/runner';

describe('Counter', () => {
  it('increments the counter button', async () => {
    // visit('/') re-renders the client-side counter, resetting it to 0.
    await twd.visit('/');

    const button = await screenDom.getByText('Count is 0');
    twd.should(button, 'be.visible');

    await userEvent.click(button);
    twd.should(button, 'have.text', 'Count is 1');

    await userEvent.click(button);
    twd.should(button, 'have.text', 'Count is 2');
  });
});
