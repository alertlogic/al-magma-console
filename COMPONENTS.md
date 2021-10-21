## Ten (errrr, eight) Commandments of Shared Components


1.  There should always be a 1:1 correspondence between component selectors, class names, and file names.
    `ald-button-v2` -> `AldButtonV2Component` -> `ald-button-v2.component.ts`(|`.scss`|`.html`)  
    No exceptions, please.
    
2.  @Outputs (EventEmitters) should be past participle verbs -- e.g., `changed`, `scrolled`, `clicked` -- or action phrases e.g., `onChange`, `onScroll`, `onClick`.  
    No nouns (e.g., `bottom`, `click`, or `picked`).

    If a component deals with more than a single type of entity, its @Output names should indicate which entity they relate to -- for instance, 
    `@Output() selectedDeployment = new EventEmitter<AlDeploymentDescriptor>()`.

    @Outputs should *always* declare the type of the data they emit.
    
3.  Except for *the most* complex components, favor multiple atomic @Inputs rather than a single complex @Input describing all behaviors in the component.
    Rationale: that component is best whose markup is expressive and comprehensible by itself.
    
    Consider the difference between
        `<al-complex-widget [config]="complexConfig"></al-complex-widget>`
            and
        `<al-complex-widget [options]="deploymentList" [categories]="deploymentTypes" [filter]="query" [hideEmpties]="true" labelField="deployment_name" flavor="jolly-green-giant"></al-complex-widget>`       
        
    The compactness of the first form actually makes it necessary to correlate multiple files (template, code-behind, and interface) to understand the output behavior.
    The expressiveness of the second form makes it much easier for maintainers and bug-hunters to form expectations about component behavior and the general shape of the rendered output.
    
4.  Very simple ancillary interfaces may be exported directly from the component's typescript code.
    Once ancillary interfaces develop any complexity, or become classes with their own logic, they should
        a) Be exported from a separate typescript file in the same directory as the component if they are specific to that component
            or
        b) Be exported from a separate typescript file in a `types` subdirectory of the module if they are reused across multiple components.
        
    Always favor interfaces over classes, since they do not add to bundle size or tree-shaking complexity.

    Lastly, @Injectable() services should *never* be nested inside component directories.

5.  Every component should include a `README.md` file in the root of the component directory providing reasonable documentation for the component and
    its variations and options.  These will be sucked into resources and expressed in the usage guide/pattern library.

6.  If a component has one or more subcomponents that are *specific* to it (e.g., not reused elsewhere and not exported from the module for external use),
    those subcomponents should be nested in subfolders of the directory containing the parent component.  In this case, it is not necessary
    to express the complete component name, only its significance in the context of the parent component.  Consider the hierarchy:

    al-dynamic-form
        element -> al-dynamic-form-element
            responder-input -> al-responder-input-element

    This is economical and prevents pollution of the top level directory.
    
7.  Really, truly avoid direct DOM manipulation -- it will break SSR rendering in unpredictable and difficult-to-track ways.

8.  Never *don't* use view encapsulation.  Every time you do, God smites a unicorn, which in turn will cause Poem to smite you.

