/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {ChildPart} from '../lit-html.js';
import {directive, Directive} from '../directive.js';
import {isDirectiveResult} from '../directive-helpers.js';

export interface RenderLightHost extends HTMLElement {
  renderLight(): unknown;
}

class RenderLight extends Directive {
  render() {
    /* SSR handled specially in render-lit-html */
  }
  update(part: ChildPart) {
    const instance = part.parentNode as RenderLightHost;
    if (typeof instance.renderLight === 'function') {
      return instance.renderLight();
    }
  }
}

/**
 * This directive allows a host element to control its light DOM rendering in
 * addition to its shadow DOM rendering, by implementing a renderLight() method.
 *
 * Here's an example of a <x-story> element that intended to server and client
 * side render its light DOM, but only client-side render its shadow DOM.
 *
 * The light DOM will contain just content:
 *
 * ```html
 * <x-story>
 *   <h1>Hello World</h1>
 *   <p>This is a story about greeting the earth.</p>
 * </x-story>
 * ```
 *
 * On the client the shadow DOM renders as usually and contains the "chrome" or
 * the decoration and interactive elements:
 *
 * ```html
 * <x-story>
 *   #shadow-root
 *     <slot></slot>
 *     <button>Like></button>
 *   <h1>Hello World</h1>
 *   <p>This is a story about greeting the earth.</p>
 * </x-story>
 * ```
 *
 * Implementation (using `LitElement`):
 *
 * ```js
 * class StoryElement extends LitElement implements RenderLightHost {
 *
 *   @property() title;
 *   @property() body;
 *
 *   renderLight() {
 *     return html`
 *       <h1>${this.title}</h1>
 *       <p>${this.body}</p>
 *     `;
 *   }
 *
 *   render() {
 *     return html`
 *       <slot></slot>
 *       <button @client=${this.like}>Like</button>
 *     `
 *   }
 * }
 * ```
 *
 * To use the renderLight() method, the use-site of the element must opt into it
 * with the renderLight directive:
 *
 * ```js
 * const story = {
 *   title: 'Hello World',
 *   body: 'This is a story about greeting the earth.',
 * };
 *
 * const t = (story) => html`
 *     <x-story
 *         .title=${story.title}
 *         .body=${story.body}>
 *       ${renderLight()}
 *     </x-story>`
 * ```
 *
 * This prevents contention on the light DOM between the user of the component
 * and the component itself. The component doesn't actually render to its
 * light DOM, its user does. The component provides the implementation.
 *
 * The component will also need to provide its light DOM styling. This is TBD,
 * but obviously won't be able to take advantage of shadow DOM scoping.
 *
 * The major advantage of structuring SSR'ed components this way is that we can
 * render the critical content on the server so that it's indexable and
 * renderable without loading component definitions, but we don't bloat the HTML
 * payload with copies of the component implementation markup. Users who have
 * split light an shadow DOM rendering in a similar way have reported that it's
 * faster to first contentful paint than the "deep" SSR that is common place.
 */
export const renderLight = directive(RenderLight);

export const isRenderLightDirective = (value: unknown): boolean =>
  isDirectiveResult(value, RenderLight);