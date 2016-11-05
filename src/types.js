// @flow

/**
 * Flow types
 * @module types
 */

/**
 * Source
 *
 * @memberof types
 * @static
 */
export type Source = {
  id: string,
  url?: string,
  sourceMapURL?: string
};

/**
 * Source File Location
 *
 * @memberof actions/types
 * @static
 */
export type Location = {
  sourceId: string,
  line: number,
  column?: number
};

/**
 * Breakpoint
 *
 * @memberof actions/types
 * @static
 */
export type Breakpoint = {
  id: string,
  location: Location,
  loading: boolean,
  disabled: boolean,
  text: string,
  condition: ?string,
};

/**
 * Source Text
 *
 * @memberof actions/types
 * @static
 */
export type SourceText = {
  id: string,
  text: string,
  contentType: string
};

/**
 * Scope
 * @memberof types
 * @static
 */
export type Scope = {
  actor: string,
  parent: Scope,
  bindings: {
    // FIXME Define these types more clearly
    arguments: Array<Object>,
    variables: Object
  },
  function: {
    actor: string,
    class: string,
    displayName: string,
    location: Location,
    // FIXME Define this type more clearly
    parameterNames: Array<Object>
  },
  type: string
}

/**
 * Frame
 * @memberof types
 * @static
 */
export type Frame = {
   id: string,
   displayName: string,
   location: Location,
   source: Source,
   scope: Scope,
   // FIXME Define this type more clearly
   this: Object
 }
