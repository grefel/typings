import {SceneNodeList} from "./index";

declare class Point {
    x: number;
    y: number;
}

declare class Matrix {
}

declare class Color {
    /**
     * Integer 0-255. Get/set the alpha channel value.
     */
    public a: number;

    /**
     * Integer 0-255. Get/set the red channel value.
     */
    public r: number;

    /**
     * Integer 0-255. Get/set the green channel value.
     */
    public g:number;

    /**
     * Integer 0-255. Get/set the blue channel value.
     */
    public b:number;

    /**
     * Creates a new color instance.
     * @param value String in CSS color format (hex, rgb, rgba, hsl, hsla, hsv, hsva, or color name); or ARGB numeric value (unsigned 32-bit integer); or object with r, g, b, a keys all set to integers from 0 - 255 (if a is omitted, 255 is used).
     * @param opacity Optional, floating-point value from 0 - 1. Use when value parameter doesn't specify an opacity and you don't want the default 1.0 (100%) opacity.
     */
    public constructor(value: string | {r:number, g:number, b:number, a?:number}, opacity?: number);

    /**
     * Convert to an object with r, g, b, a keys where r, g, b, a range from 0 - 255.
     */
    public toRgba(): {r:number, g:number, b:number, a:number};

    /**
     * Convert to hex string with "#" prefix. Ignores the Color's alpha value. Returns a 3-digit string if possible, otherwise returns a 6-digit string.
     * @param forceSixDigits True if you want the result to always have 6 digits.
     */
    public toHex(forceSixDigits:boolean):string;

    /**
     * Returns a clone of the current color object
     */
    public clone(): Color;
}

declare class LinearGradientFill {
}

declare class RadialGradientFill {
}

declare class BitmapFill {
}

declare class Shadow {
}

declare class Blur {
}

declare class Bounds {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
}

/**
 * Base class of all scenegraph nodes. Nodes will always be an instance of some subclass of SceneNode.
 */
declare abstract class SceneNode {
    /**
     * Returns a unique identifier for this node that stays the same when the file is closed & reopened, or if the node is moved to a different part of the document. Cut-Paste will result in a new guid, however.
     */
    public readonly guid: string;
    /**
     * Returns the parent node. Null if this is the root node, or a freshly constructed node which has not been added to a parent yet.
     */
    public readonly parent: SceneNode | null;
    /**
     * Returns a list of this node’s children. List is length 0 if the node has no children. The first child is lowest in the z order.
     * This list is not an Array, so you must use at(i) instead of [i] to access children by index. It has a number of Array-like methods such as forEach() for convenience, however.
     * The list is immutable. Use removeFromParent and addChild to add/remove child nodes.
     */
    public readonly children: SceneNodeList;
    /**
     * True if the node’s parent chain connects back to the document root node.
     */
    public readonly isInArtworkTree: boolean;
    /**
     * True if this node is a type that could have children (e.g. an Artboard, Group, Boolean Group, etc.).
     */
    public readonly isContainer: boolean;
    /**
     * True if this node is part of the current selection. To change which nodes are selected, use selection.
     */
    public readonly selected: boolean;

    /**
     * False if this node has been hidden by the user (eyeball toggle in Layers panel). If true, the node may still be invisible for other reasons: a parent or grandparent has visible=false, the node has opacity=0%, the node is clipped by a mask, etc.
     */
    public visible: boolean;

    /**
     * (0.0-1.0)Node’s opacity setting. The overall visual opacity seen on canvas is determined by combining this value with the opacity of the node’s entire parent chain, as well as the opacity settings of its fill/stroke properties if this is a leaf node.
     */
    public opacity: number;

    /**
     * Affine transform matrix that converts from the node’s local coordinate space to its parent’s coordinate space. The matrix never has skew or scale components, and if this node is an Artboard the matrix never has rotation either. Rather than working with the raw matrix directly, it may be easier to use methods such as placeInParentCoordinates or rotateAround.
     * Returns a fresh Matrix each time, so this can be mutated by the caller without interfering with anything. Mutating the returned Matrix does not change the node’s transform - only invoking the ‘transform’ setter changes the node. To modify an existing transform, always be sure to re-invoke the transform setter rather than just changing the Matrix object’s properties inline. See “Properties with object values”.
     * For an overview of node transforms & coordinate systems, see Coordinate spaces.
     */
    public transform: Matrix;

    /**
     * The translate component of this node’s transform. Since translation is applied after any rotation in the transform Matrix, translation occurs along the parent’s X/Y axes, not the node’s own local X/Y axes. This is equivalent to the e & f fields in the transform Matrix.
     * For an overview of node positioning & coordinate systems, see Coordinate spaces.
     */
    public translation: Point;

    /**
     * The rotation component of this node’s transform, in clockwise degrees.
     * For an overview of node transforms & coordinate systems, see Coordinate spaces.
     */
    public readonly rotation: number;

    /**
     * The node’s path bounds in document-global coordinate space (represented by a bounding box aligned with global X/Y axes). Path bounds match the selection outline seen in the XD, but exclude some visual parts of the node (outer stroke, drop shadow / blur, etc.).
     */
    public readonly globalBounds: Bounds;

    /**
     * The node’s path bounds in its own local coordinate space. This coordinate space may be rotated and translated relative to the parent’s coordinate space. Path bounds match the selection outline seen in XD, but exclude some visual parts of the node (outerstroke, drop shadow / blur, etc.).
     * The visual top-left of a node’s path bounds is located at (localBounds.x, localBounds.y). This value is not necessarily (0,0) in the local coordinate space: for example, a text node’s baseline is at y=0 in local coordinates, so the top of the text has a negative y value.
     */
    public readonly localBounds: Bounds;

    /**
     * The node’s path bounds in its parent’s coordinate space (represented by a bounding box aligned with the parent’s X/Y axes - so if the node has rotation, the top-left of the node is not necessarily located at the top-left of boundsInParent). Path bounds match the selection outline seen in XD, but exclude some visual parts of the node (outer stroke, drop shadow / blur, etc.).
     */
    public readonly boundsInParent: Bounds;

    /**
     * The position of the node’s upper-left corner (localBounds.x, localBounds.y) in its parent’s coordinate space. If the node is rotated, this is not the same as the top-left corner of boundsInParent. This is a shortcut for node.transform.transformPoint({x: node.localBounds.x, y: node.localBounds.y})
     */
    public readonly topLeftInParent: Point;

    /**
     * The position of the node’s centerpoint in its own local coordinate space. Useful as an argument to rotateAround. This is a shortcut for {x: localBounds.x + localBounds.width/2, y: localBounds.y + localBounds.height/2})
     */
    public readonly localCenterPoint: Point;

    /**
     * The node’s draw bounds in document-global coordinate space. Draw bounds are larger than the selection outline seen in XD, including outer stroke, drop shadow / blur, etc. - every visible pixel of the node is encompassed by these bounds. This matches the image dimensions if the node is declareed as a PNG/JPEG bitmap.
     */
    public readonly globalDrawBounds: Bounds;

    /**
     * Node name as seen in the Layers panel. Also used as filename during declare.
     */
    public name: string;

    /**
     * True if name is a generic, auto-generated string (e.g. “Rectangle 5”). False if name has been explicitly set.
     */
    public readonly hasDefaultName: boolean;

    /**
     * True if the node is locked, meaning it cannot normally be selected.
     */
    public locked: boolean;

    /**
     * True if the node should be included in the output of File > declare > Batch and other bulk-declare workflows.
     */
    public markedFordeclare: boolean;

    /**
     * True if the node’s appearance comes from a link to an external resource, such as Creative Cloud Libraries.
     */
    public readonly hasLinkedContent: boolean;

    /**
     * Remove this node from its parent, effectively deleting it from the document.
     */
    public removeFromParent(): void;

    /**
     * Move the node by the given number of pixels along the parent’s X/Y axes (if this node has no rotation, this is identical to moving the node along its own local X/Y axes). This is equivalent to modifying the value returned by ‘translation’ and then setting it back.
     * For an overview of node positioning & coordinate systems, see Coordinate spaces.
     * @param {number} deltaX
     * @param {number} deltaY
     */
    public moveInParentCoordinates(deltaX: number, deltaY: number): void;

    /**
     * Move the node so the given point in its local coordinates is placed at the given point in its parent’s coordinates (taking into account any rotation on this node, etc.).
     * For an overview of node positioning & coordinate systems, see Coordinate spaces.
     * @param {scenegraph.Point} registrationPoint Point in this node’s local coordinate space to align with parentPoint
     * @param {scenegraph.Point} parentPoint Point in this node’s parent’s coordinate space to move registrationPoint to
     */
    public placeInParentCoordinates(
        registrationPoint: Point,
        parentPoint: Point
    ): void;

    /**
     * Rotate the node clockwise by the given number of degrees around the given point in the plugin’s local coordinate space. If this node already has nonzero rotation, this operation adds to its existing angle.
     * @param {number} deltaAngle In degrees.
     * @param {scenegraph.Point} rotationCenter Point to rotate around, in node’s local coordinates.
     */
    public rotateAround(deltaAngle: number, rotationCenter: Point): void;

    /**
     * Attempts to change localBounds.width & height to match the specified sizes. This operation may not succeed, since some nodes are not resizable. Resizing one dimension may affect the other, if the node’s aspect ratio is locked.
     * @param {number} width
     * @param {number} height
     */
    public resize(width: number, height: number): void;
}

/**
 * Base class for nodes that have a stroke and/or fill. This includes leaf nodes such as Rectangle, as well as BooleanGroup which is a container node. If you create a shape node, it will not be visible unless you explicitly give it either a stroke or a fill.
 */
declare class GraphicsNode extends SceneNode {
    /**
     * The fill applied to this shape, if any. If this property is null or fillEnabled is false, no fill is drawn. Freshly created nodes have no fill by default.
     *
     * For Line objects, fill is ignored. For Text objects, only solid Color fill values are allowed.
     *
     * To modify an existing fill, always be sure to re-invoke the fill setter rather than just changing the fill object’s properties inline. See “Properties with object values”.
     *
     * Known issue: When modifying a gradient fill object specifically, you must clone the gradient returned by the getter before modifying it, to avoid issues with Undo history.
     */
    public fill:
        | null
        | Color
        | LinearGradientFill
        | RadialGradientFill
        | BitmapFill;

    /**
     * If false, the fill is not rendered. The user can toggle this via a checkbox in the Properties panel.
     */
    public fillEnabled: boolean;

    /**
     * The stroke color applied to this shape, if any. If this property is null or strokeEnabled is false, no stroke is drawn. Freshly created nodes have no stroke by default. Artboard objects ignore stroke settings.
     *
     * Depending on the strokeWidth and strokePosition, the path outline of a node may need to be positioned on fractional pixels in order for the stroke itself to be crisply aligned to the pixel grid. For example, if a horizontal line uses a 1px center stroke, the line’s y should end in .5 to keep the stroke on-pixel.
     *
     * To modify an existing stroke, always be sure to re-invoke the stroke setter rather than just changing the Color object’s properties inline. See “Properties with object values”.
     */
    public stroke: null | Color;

    /**
     * If false, the stroke is not rendered. The user can toggle this via a checkbox in the Properties panel.
     */
    public strokeEnabled: boolean;

    /**
     * Thickness in pixels of the stroke.
     * value must be >= 0
     */
    public strokeWidth: number;

    /**
     * Position of the stroke relative to the shape’s path outline: GraphicNode.INNER_STROKE, OUTER_STROKE, or CENTER_STROKE.
     */
    public strokePosition: string;

    /**
     * For Lines and non-closed Paths, how the dangling ends of the stroke are rendered: GraphicNode.STROKE_CAP_NONE, STROKE_CAP_SQUARE, or STROKE_CAP_ROUND.
     */
    public strokeEndCaps: string;

    /**
     * How sharp corners in the shape are rendered: GraphicNode.STROKE_JOIN_BEVEL, STROKE_JOIN_ROUND, or STROKE_JOIN_MITER.
     */
    public strokeJoins: string;

    /**
     * value must be >= 0
     */
    public strokeMiterLimit: number;

    /**
     * Empty array indicates a solid stroke. If non-empty, values represent the lengths of rendered and blank segments of the stroke’s dash pattern, repeated along the length of the stroke. The first value is the length of the first solid segment. If the array is odd length, the items are copied to double the array length. For example, [3] produces the same effect as [3, 3].
     *
     * The appearance of each segment’s start/end follows the strokeEndCaps setting.
     */
    public strokeDashArray: Array<number>;

    /**
     * Ignored unless strokeDashArray is non-empty. Shifts the “phase” of the repeating dash pattern along the length of the stroke.
     */
    public strokeDashOffset: number;

    /**
     * The node’s dropshadow, if any. If there is no shadow applied, this property may be null or shadow.visible may be false.
     */
    public shadow: null | Shadow;

    /**
     * The node’s object blur or background blur settings, if applicable. If there is no blur effect applied, this property may be null or blur.visible may be false.
     */
    public blur: null | Blur;

    /**
     * Returns a representation of the node’s outline in SVG <path> syntax. Note that only nodes with strokePosition == GraphicNode.CENTER_STROKE can be faithfully rendered in actual SVG using the exact pathData shown here.
     */
    public readonly pathData: string;

    /**
     * True if the node’s image fill comes from a link to an external resource, such as Creative Cloud Libraries.
     */
    public readonly hasLinkedGraphicFill: boolean;
}

/**
 * Artboard container node. All Artboards must be children of the root node (they cannot be nested), and they must be placed below all pasteboard content in the z order.
 *
 * Artboards can have a background fill, but the stroke, shadow, and blur settings are all ignored. Artboards cannot be locked or hidden, or have opacity < 100%.
 *
 * If a node is changed to overlap an Artboard, it will automatically become a child of the artboard when the operation finishes, and similar if a node is changed to no longer overlap an Artboard. It is not possible to have a node overlapping an Artboard that does not become a child of the artboard, or vice versa, a node that falls entirely outside an Artboard’s bounds but remains its child.
 */
declare class Artboard extends GraphicsNode {
    /**
     * value must be >= 0
     */
    public width: number;

    /**
     * For scrollable Artboards, this is the total height encompassing all content - not just the viewport size (i.e. screen height).
     *
     * value must be >= 0
     */
    public height: number;

    /**
     * If Artboard is scrollable, this is the height of the viewport (e.g. mobile device screen size). Null if Artboard isn’t scrollable.
     */
    public viewportHeight: null | number;

    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}

/**
 * Rectangle leaf node shape, with or without rounded corners. Like all shape nodes, has no fill or stroke by default unless you set one.
 */
declare class Rectangle extends GraphicsNode {
    /**
     * value must be >= 0
     */
    public width: number;

    /**
     * value must be >= 0
     */
    public height: number;

    /**
     * To set all corners to the same value, use setAllCornerRadii.
     */
    public cornerRadii: {
        topLeft: number;
        topRight: number;
        bottomRight: number;
        bottomLeft: number;
    };

    /**
     * True if any of the Rectangle’s four corners is rounded (corner radius > 0).
     */
    public readonly hasRoundedCorners: boolean;
    /**
     * The actual corner radius that is rendered may be capped by the size of the rectangle. Returns the actual radii that are currently in effect, which may be smaller than the cornerRadii values as a result.
     */
    public effectiveCornerRadii: {
        topLeft: number;
        topRight: number;
        bottomRight: number;
        bottomLeft: number;
    };

    /**
     * Set the rounding radius of all four corners of the Rectangle to the same value. To set the corners to different radius values, use cornerRadii.
     * @param {number} radius New radius of all corners
     */
    public setAllCornerRadii(radius: number): void;
}

/**
 * Ellipse leaf node shape.
 */
declare class Ellipse extends GraphicsNode {
    public radiusX: number;
    public radiusY: number;
    /**
     * True if the Ellipse is a circle (i.e., has a 1:1 aspect ratio).
     */
    public isCircle: boolean;
}

/**
 * Line leaf node shape.
 */
declare class Line extends GraphicsNode {
    /**
     * Start point of the Line in local coordinate space.TEMP: To change the start point, use setStartEnd.
     */
    public readonly start: Point;
    /**
     * Endpoint of the Line in local coordinate space.TEMP: To change the endpoint, use setStartEnd.
     */
    public readonly end: Point;

    /**
     * Set the start and end points of the Line in local coordinate space. The values may be normalized by this setter, shifting the node’s translation and counter-shifting the start/end points. So the start/end setters may return values different from the values you passed this setter, even though the line’s visual bounds and appearance are the same.
     * @param {number} startX
     * @param {number} startY
     * @param {number} endX
     * @param {number} endY
     */
    public setSTartEnd(
        startX: number,
        startY: number,
        endX: number,
        endY: number
    ): void;
}

/**
 * Arbitrary vector Path leaf node shape.
 *
 * The path may not start at (0,0) in local coordinates, for example if it starts with a move (“M”)
 */
declare class Path extends GraphicsNode {
    /**
     * Representation of the path outline in SVG <path> syntax. Unlike other node types, pathData is writable here. Syntax is automatically normalized, so the getter may return a slightly different string than what you passed to the setter.
     */
    public pathData: string;
}

/**
 * BooleanGroup container node - although it has fill/stroke/etc. properties like a leaf shape node, it is a container with children. Its visual appearance is determined by generating a path via a nondestructive boolean operation on all its children’s paths.
 *
 * It is not currently possible for plugins to create a new BooleanGroup node, aside from using commands.duplicate to clone existing BooleanGroups.
 */
declare class BooleanGroup extends GraphicsNode {
    /**
     * Which boolean operation is used to generate the path: BooleanGroup.PATH_OP_ADD, PATH_OP_SUBTRACT, PATH_OP_INTERSECT, or PATH_OP_EXCLUDE_OVERLAP.
     */
    public readonly pathOp: string;

    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}

/**
 * Text leaf node shape. Text can have a fill and/or stroke, but only a solid-color fill is allowed (gradient or image will will be rejected).
 *
 * There are two types of Text nodes:
 * - Point Text - Expands to fit the full width of the text content. Only uses multiple lines if the text content contains hard line breaks ("\n").
 * - Area Text - Fixed width and height. Text is automatically wrapped (soft line wrapping) to fit the width. If it does not fit the height, any remaining text is clipped. Check whether areaBox is null to determine the type of a Text node.
 *
 * The baseline of a Point Text node is at y=0 in its own local coordinate system. Horizontally, local x=0 is the anchor point that the text grows from / shrinks toward when edited. This anchor depends on the justification: for example, if the text is centered, x=0 is the horizontal centerpoint of the text.
 *
 * The bounds reported for a Text object leave enough space for descenders, uppercase letters, and accent marks, even if the current string does not contain any of those characters. This makes aligning text based on its bounds behave more consistently.
 */
declare class Text extends GraphicsNode {
    /**
     * The plaintext content of the node, including any hard line breaks but excluding soft line wrap breaks.
     *
     * Setting text does not change styleRanges, so styles aligned with the old text’s string indices will continue to be applied to the new string’s indices unless you explicitly change styleRanges as well.
     */
    public text: string;

    /**
     * Array of text ranges and their character style settings. Each range covers a set number of characters in the text content. Ranges are contiguous, with each one starting immediately after the previous one. Any characters past the end of the last range use the same style as the last range.
     *
     * When setting styleRanges, any fields missing from a given range default to the existing values from the last range in the old value of styleRanges. The styleRanges getter always returns fully realized range objects with all fields specified.
     */
    public styleRanges: Array<{
        length: number;
        fontFamily: string;
        fontStyle: string;
        fontSize: number;
        fill: Color;
        charSpacing: number;
        underline: boolean;
    }>;

    /**
     * If true, the text is drawn upside down.
     */
    public flipY: boolean;

    /**
     * Horizontal alignment: Text.ALIGN_LEFT, ALIGN_CENTER, or ALIGN_RIGHT. This setting affects the layout of multiline text, and it also affects what direction text grows when edited on canvas.
     */
    public textAlign: string;

    /**
     * Distance between baselines in multiline text, in document pixels. The special value 0 causes XD to use the default line spacing defined by the font given the current font size & style.
     *
     * This property is not automatically adjusted when fontSize changes, if line spacing is not set to 0, the line spacing will stay fixed while the font size changes, shifting the spacing’s proportional relationship to font size. If the value is 0, then the rendered line spacing will change to match the new font size, since 0 means the spacing is dynamically calculated from the current font settings.
     */
    public lineSpacing: number;

    /**
     * Null for point text. For area text, specifies the size of the rectangle within which text is wrapped and clipped.
     */
    public readonly areaBox: null | { width: number; height: number };

    /**
     * Always false for point text. For area text, true if the text does not fit in the content box and its bottom is being clipped.
     */
    public readonly clippedByArea: boolean;
}

/**
 * Group nodes represent two types of simple containers in XD:
 * - Plain Groups, created by the Object > Group command
 * - Masked Groups, created by the Object > Mask With Shape command You can determine whether a group is masked by checking the mask property.
 *
 * Groups and other containers cannot be created directly using scenenode constructors, since you can’t add a populated Group to the scenegraph (you can’t add subtrees all at once) nor can you add an empty Group and then add children to it (can’t add nodes outside the scope of the current edit context). Instead, to create Groups and other nested structures, use commands.
 *
 * In a Mask Group, the mask shape is included in the group’s children list, at the top of the z order. It is not visible - only its path outline is used, for clipping the group.
 */
declare class Group extends SceneNode {
    /**
     * The mask shape applied to this group, if any. This object is also present in the group’s children list. Though it has no direct visual appearance of its own, the mask affects the entire groups’s appearance by clipping all its other content.
     */
    public readonly mask: SceneNode | null;

    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}

/**
 * Container node representing one instance of a Symbol. Changes within a symbol instance are automatically synced to all other instances of the symbol, with certain exceptions (called “overrides”).
 *
 * It is not currently possible for plugins to create a new Symbol definition or a new SymbolInstance node, aside from using commands.duplicate to clone existing SymbolInstances.
 */
declare class SymbolInstance extends SceneNode {
    /**
     * An identifier unique within this document that is shared by all instances of the same Symbol.
     */
    public readonly symbolId: string;

    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}

/**
 * Repeat Grid container node containing multiple grid cells, each one a child Group. Changes within one cell are automatically synced to all the other cells, with certain exceptions (called “overrides”). A Repeat Grid also defines a rectangular clipping mask which determines how may cells are visible (new cells are automatically generated as needed if the Repeat Grid is resized larger).
 *
 * It is not currently possible for plugins to create a new RepeatGrid node, aside from using commands.duplicate to clone existing RepeatGrids.
 */
declare class RepeatGrid extends SceneNode {
    /**
     * Defines size of the RepeatGrid. Cells are created and destroyed as necessary to fill the current size. Cells that only partially fit will be clipped.
     */
    public width: number;

    /**
     * Defines size of the RepeatGrid. Cells are created and destroyed as necessary to fill the current size. Cells that only partially fit will be clipped.
     */
    public height: number;

    /**
     * Number of grid columns
     */
    public numColumns: number;

    /**
     * Number of grid rows
     */
    public numRows: number;

    /**
     * Horizontal spacing between grid cells/columns
     */
    public paddingX: number;

    /**
     * Vertical spacing between grid cells/rows
     */
    public paddingY: number;

    /**
     * The size of each grid cell. The size of each cell’s content can vary slightly due to text overrides; the cell size is always set to the width of the widest cell content and the height of the tallest cell content.
     */
    public cellSize: { width: number; height: number };

    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}

/**
 * Container node whose content is linked to an external resource, such as Creative Cloud Libraries. It cannot be edited except by first ungrouping it, breaking this link.
 */
declare class LinkedGraphic extends SceneNode {
}

/**
 * Class representing the root node of the document. All Artboards are children of this node, as well as any pasteboard content that does not lie within an Artboard. Artboards must be grouped contiguously at the bottom of this node’s z order. The root node has no visual appearance of its own.
 */
declare class RootNode extends SceneNode {
    /**
     * Adds a child node to this container node. You can only add leaf nodes this way; to create structured subtrees of content, use commands.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {number} index Optional: index to insert child at. Child is appended to end of children list (top of z order) otherwise.
     */
    public addChild(node: SceneNode, index?: number): void;

    /**
     * Inserts a child node after the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately after this existing child
     */
    public addChildAfter(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Inserts a child node before the given reference node.
     * @param {scenegraph.SceneNode} node Child to add
     * @param {scenegraph.SceneNode} relativeTo New child is added immediately before this existing child
     */
    public addChildBefore(node: SceneNode, relativeTo: SceneNode): void;

    /**
     * Removes all children from this node. Equivalent to calling removeFromParent() on each child in turn, but faster.
     */
    public removeAllChildren(): void;
}
