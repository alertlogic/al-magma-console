/**
 * This is a mock entity type representing a type of candy.  Most of these actually come out sounding disgusting...
 */
export class CandyType {
    public candyId:string;
    public brandId:string;
    public name:string;
    public flavor:string;
    public color:string;
    public caloriesPerServing:number;
    public distNetwork:string;

    public static brandMap:{[brandId:string]:string} = {
        "wonka": "Willy Wonka Candy Co",
        "n0": "Nestle",
        "mars": "Mars, Inc",
        "bimbo": "Grupo Bimbo",
        "f1": "Ferrero",
        "k1": "Kevin's Candy Co"
    };

    public static colors:{[colorCode:string]:string} = {
        "red": "Red",
        "pink": "Pink",
        "purple": "Purple",
        "yellow": "Yellow",
        "green": "Green",
        "brown": "Brown",
        "black": "Black",
        "glitz": "Sparkly"
    };

    public static flavors:{[flavor:string]:string} = {
        "grape": "Grape Soda",
        "orange": "Orange",
        "citrus": "Citrus Twist",
        "melon": "Watermelon",
        "unicorn1": "Unicorn Butt",
        "unicorn2": "Unicorn Horn"
    };

    constructor() {
    }

    public static generate():CandyType {
        let candy = new CandyType();
        let letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        candy.candyId = "";
        for ( let i = 0; i < 10; i++ ) {
            candy.candyId += letters[Math.floor(Math.random() * letters.length)];
        }
        candy.brandId = CandyType.oneOf( Object.keys( CandyType.brandMap ) );
        candy.name = CandyType.generateName();
        candy.flavor = CandyType.oneOf( Object.keys( CandyType.flavors ) );
        candy.color = CandyType.oneOf( Object.keys( CandyType.colors ) );
        candy.caloriesPerServing = 110 + Math.floor( Math.random() * 10 ) * 10;
        candy.distNetwork = null;
        return candy;
    };

    public static generateName():string {

        let adjectives = [
            "Super",
            "Gigantic",
            "Sparkling",
            "Power",
            "Spicy",
            "Mega"
        ];

        let modifiers = [
            "Unicorn",
            "Sugar",
            "Cocoa",
            "Ginger",
            "Fizz",
            "Jiggly",
            "Gummy",
            "Smurf",
            "Smurfling",
            "Cinnamon",
            "Icing",
            "Cream",
            "Honey",
            "Crystal",
            "Glucose"
        ];

        let names = [
            "Bombs",
            "Droplets",
            "Drops",
            "Balls",
            "Pellets",
            "Wafers",
            "Bar",
            "Bars",
            "Pebbles",
            "Gummies",
            "Bears",
            "Shells",
            "Ribbon",
            "Bonbons",
            "Cookies",
            "Snaps",
            "Sticks"
        ];
        return `${CandyType.oneOf(adjectives)} ${CandyType.oneOf(modifiers)} ${CandyType.oneOf(names)}`;
    }

    public static oneOf( items:string[] ):string {
        return items[Math.floor( Math.random() * items.length )];
    }
}
