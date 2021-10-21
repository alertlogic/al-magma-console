# Using Cardstack

## How to Implement a Cardstack

The basic ingredients of a cardstack are reasonably straightforward.  The component assumes that you will be retrieving the base data for the view from an API or other external source, and that the data may not lend itself directly to user-friendly display (e.g., accounts and users are represented as IDs instead of names, types are codes instead of user friendly captions, etc).
Towards that end, it provides an abstraction layer on top of whatever underlying data representation you end up using.

### Ingredient #1: Entity Model

Because the underlying data model may be obfuscated or distributed across multiple systems, cardstack requires the use of a display-specific view model.  This should be a simple interface (or class) that implements
`AlCardstackItemProperties` ( [see here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/types.ts#L154) for reference ).  Essentially, this model *must* expose an `id` and a `caption` property, and
should also include any other properties that can be searched, filtered on, grouped by, or sorted upon.  Properties should be simple scalar values (or arrays of scalar values), and don't need to worry about human readability -- account IDs 
and entity IDs are fine, and user-friendliness is implemented in the next step.

To see how the underlying entity data is converted into the simplified property model, see Ingredient #3c: Property Extraction.

*TODO: example property interfaces*

### Ingredient #2: View Characteristics

Individual views have a lot of different requirements around pagination, filtration, API calls, and filter rules.  Some of these may be dynamic or come be retrieved from APIs.  Towards this end, each view requires (as an input) an `AlCardstackCharacteristics`
interface (see [here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/types.ts#L78) for reference) that defines which properties can be sorted, searched, filtered, or grouped, and what their human friendly captions are.
Some of these can be calculated dynamically or autodiscovered from the data.

*TODO: example characteristics*

### Ingredient #3: View Class

The actual view state of a cardstack is managed by an instance of a class that extends `AlCardstackView` ( [see here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/al-cardstack-view.ts#L13) for reference ) and provides
a a specific entity type (whatever comes from the underlying data layer) and the property DTO defined in step 1.  The underlying `AlCardstackView` class does most of the work of of maintaining the view state, but each implementation
of `AlCardstackView` must provide at least two function overrides and may further customize the behavior of the view by providing some optional methods as well.

#### Ingredient #3a: Characteristics Generator (optional)

If the view characteristics are generated asyncronously, then instead of providing the characteristics to cardstack's constructor, the extension may provide a `generateCharacteristics()` method ( [see here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/al-cardstack-view.ts#L350) for reference )
that generates the characteristics information dynamically.

#### Ingredient #3b: Data Retrieval (required)

Each cardstack implementation must implement a `fetchData()` method ( [see here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/al-cardstack-view.ts#L332) for reference ) that retrieves raw entity data
from the view's datasource(s).  

This method must fulfill three obligations:

1.  Asyncronously return an array of raw entity data
2.  Update the view's pagination state to indicate if there are more results available, and if so how many
3.  Apply any server-side filters, sort rules, grouping, or search implied by the view.  If the view characteristics indicate that a given property is handled client side, any applied remote filter rules will be provided to `fetchData` as a second parameter.

#### Ingredient #3c: Property Extraction

The raw data provided by `fetchData()` will be ingested into the view automatically by the underlying `AlCardstackView` class, but a specific view implementation must also provide a way to convert raw entity data into the property DTO defined as Ingredient #1.

To perform this work, each cardstack implementation must provide a `deriveEntityProperties()` method ( [see here](https://github.com/alertlogic/nepal-core/blob/master/src/common/cardstack/al-cardstack-view.ts#L338) for reference ) that takes a raw entity as an input and returns a property DTO as a result.

## Example Implementations

There are a few cardstack implementations that may be useful as examples.

 - [Example #1: Notifications List](https://algithub.pd.alertlogic.net/defender/nepal-ng-common-components/blob/master/projects/ng-notifications-components/src/lib/types/al-artifacts-cardstack.ts) is perhaps the most complex example we will ever have.  Its underlying data consists of synthetic entities combining subscriptions and other entities across the IWS service, virtually all of its optional methods are implemented, and it has almost two dozen properties in its display model.  If you want to be thoroughly confused, start here!
 - [Example #2: Usage Guide](https://algithub.pd.alertlogic.net/defender/nepal-ng-common-components/tree/master/examples/usage-guide/src/app/components/cardstack) is a better starting place.  It's a simple implementation that uses most optional functionality.

