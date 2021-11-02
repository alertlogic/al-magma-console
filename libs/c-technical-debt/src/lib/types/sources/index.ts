/**
 *  A bunch of classes to describe source-related structures.
 *
 *  @author Julian David Moreno <jgalvis@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2017
 */

export class ScopeDescriptor {
    public key: string = null;
    public type: string = null;
    constructor() { }
}

export class SourceScope {
    public scopeInclude: ScopeDescriptor[];
    public scopeExclude: ScopeDescriptor[];
    public scopeIncludeByKey: { [key: string]: ScopeDescriptor } = {};
    public scopeExcludeByKey: { [key: string]: ScopeDescriptor } = {};
    constructor() { }
}

/**
 *  AssetDescriptor provides a class to describe any ol' asset, along with its
 *  raw properties and annotations.
 */
export class SourceDescriptor {
    public config: object = null;
    public created: object = null;
    public enabled: boolean = null;
    public host: object = null;
    public id: string = null;
    public modified: object = null;
    public name: string = null;
    public product_type: string = null;
    public status: object = null;
    public tags: Array<number> = [];
    public type: string = null;

    constructor() {
    }

    public static import(rawData: any) {
        let source = new SourceDescriptor();

        if (!rawData.hasOwnProperty("type") || !rawData.hasOwnProperty("id")) {
            console.warn("Unexpected input: source representations must have at least 'type' and 'id' properties");
            return source;
        }

        source.config = rawData.config;
        source.created = rawData.created;
        source.enabled = rawData.enabled;
        source.host = rawData.host;
        source.id = rawData.id;
        source.modified = rawData.modified;
        source.name = rawData.name;
        source.product_type = rawData.product_type;
        source.status = rawData.status;
        source.tags = rawData.tags;
        source.type = rawData.type;
        return source;
        }
 public static importArray( rawArray: any ): Array<SourceDescriptor>{
        let sourceArray: Array<SourceDescriptor> = [];
        for (let rawSource of rawArray){
            sourceArray.push(SourceDescriptor.import(rawSource.source));
        }
        return sourceArray;
    }

}

/**
 *  A class to manage a full source representation and provide structured access to its data.
 */
export class SourceSnapshot {
    public source: SourceDescriptor;
    public sourceByKey: { [key: string]: SourceDescriptor } = {};

    constructor() {}

    /**
     *  Gets any node in the tree, identified by key
    */
    public getScope(provider: string = 'aws') {
        let scope = new SourceScope();

        if (this.source.config.hasOwnProperty(provider)) {

            let config = this.source.config[provider];
            let scopeType;
            scope['scopeInclude'] = [];
            scope['scopeExclude'] = [];
            scope['scopeIncludeByKey'] = {};
            scope['scopeExcludeByKey'] = {};

            if (!config.hasOwnProperty('scope')) {
                return scope;
            }

            if (!config.scope.hasOwnProperty('include')) {
                this.source.config[provider].scope['include'] = [];
            }

            if (!config.scope.hasOwnProperty('exclude')) {
                this.source.config[provider].scope['exclude'] = [];
            }

            for (let i = 0; i < this.source.config[provider].scope.include.length; i++) {
                scopeType = this.source.config[provider].scope.include[i];
                scope.scopeInclude.push(scopeType);
                scope.scopeIncludeByKey[scopeType.key] = scopeType;
            }

            for (let o = 0; o < this.source.config[provider].scope.exclude.length; o++) {
                scopeType = this.source.config[provider].scope.exclude[o];
                scope.scopeExclude.push(scopeType);
                scope.scopeExcludeByKey[scopeType.key] = scopeType;
            }

            return scope;
        }
        return null;
    }

    /**
     * Inserts an SourceDescriptor into the source object
     */
    public add(source: SourceDescriptor) {

        if (this.sourceByKey.hasOwnProperty(source.id)) {
            console.warn("Internal error: cannot add an existing source to a Source Snapshot. For shame!");
            return source;
        }
        this.sourceByKey[source.id] = source;
        this.source = source;
        return source;
    }

    /**
     *  @method SourceSnapshot.import
     *
     *  It returns a populated instance of type SourceSnapshot.
     */
    public static import(rawData: any) {
        let deployment = new SourceSnapshot();

        if (!rawData.hasOwnProperty("source")) {
            console.warn("Unexpected input: the input data to SourceSnapshot.import does not appear to be valid source data");
            return deployment;
        }

        let source = SourceDescriptor.import(rawData.source);
        deployment.add(source);

        return deployment;
    }
}
