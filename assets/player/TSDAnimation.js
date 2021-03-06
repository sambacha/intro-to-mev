var KNAnimationActionAcceleration = {
	KNAnimationActionAccelerationNone: 0,
	KNAnimationActionAccelerationEaseIn: 1,
	KNAnimationActionAccelerationEaseOut: 2,
	KNAnimationActionAccelerationEaseBoth: 3,
	KNAnimationActionAccelerationCustom: 4,
};
var KNActionOpacityName = "apple:action-opacity";
var KNActionMotionPathName = "apple:action-motion-path";
var KNActionRotationName = "apple:action-rotation";
var KNActionScaleName = "apple:action-scale";
var KNActionPopName = "apple:action-pop";
var KNActionPulseName = "apple:action-pulse";
var KNActionBlinkName = "apple:action-blink";
var KNActionFlipName = "apple:action-flip";
var KNActionBounceName = "apple:action-bounce";
var KNActionJiggleName = "apple:action-jiggle";
var KNDirection = {
	KNDirectionNone: 0,
	KNDirectionLeftToRight: 11,
	KNDirectionRightToLeft: 12,
	KNDirectionTopToBottom: 13,
	KNDirectionBottomToTop: 14,
	KNDirectionUpperLeftToBottomRight: 21,
	KNDirectionUpperRightToBottomLeft: 22,
	KNDirectionLowerLeftToUpperRight: 23,
	KNDirectionLowerRightToUpperLeft: 24,
	KNDirectionClockwise: 31,
	KNDirectionCounterclockwise: 32,
	KNDirectionIn: 41,
	KNDirectionOut: 42,
	KNDirectionUp: 43,
	KNDirectionDown: 44,
	KNDirectionStartToEnd: 51,
	KNDirectionEndToStart: 52,
	KNDirectionMiddleToEnds: 53,
	KNDirectionEndsToMiddle: 54,
	KNDirectionRandom: 91,
	KNDirectionAlternating: 92,
	KNDirectionSimultaneous: 93,
	KNDirectionBCForward: 111,
	KNDirectionBCBackward: 112,
	KNDirectionBCRandom: 113,
	KNDirectionBCCenter: 114,
	KNDirectionBCEdges: 115,
	KNDirectionGravity: 121,
	KNDirectionNoGravity: 122,
};
var KNAnimationStringTypeNone = "None";
var KNAnimationStringTypeBuildIn = "In";
var KNAnimationStringTypeBuildOut = "Out";
var KNAnimationStringTypeTransition = "Transition";
var KNAnimationStringTypeActionBuild = "Action";
function KNEffectIsActionEffect(a) {
	if (
		[
			KNActionOpacityName,
			KNActionMotionPathName,
			KNActionRotationName,
			KNActionScaleName,
		].indexOf(a) > -1
	) {
		return true;
	} else {
		return false;
	}
}
function KNEffectIsEmphasisEffect(a) {
	if (
		[
			KNActionPopName,
			KNActionPulseName,
			KNActionBlinkName,
			KNActionFlipName,
			KNActionBounceName,
			KNActionJiggleName,
		].indexOf(a) > -1
	) {
		return true;
	} else {
		return false;
	}
}
var TSDTextureType = {
	Unknown: 0,
	Background: 1,
	Shadow: 2,
	ContactShadow: 3,
	GroupedShadow: 4,
	Object: 5,
	Text: 6,
	StrokeParameterized: 7,
	Stroke: 8,
	StrokeLineEndForHead: 9,
	StrokeLineEndForTail: 10,
	Reflection: 11,
	FrameMask: 12,
	ReflectionMask: 13,
};
