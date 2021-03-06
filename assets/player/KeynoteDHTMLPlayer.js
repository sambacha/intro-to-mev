var kOrientationUnknown = "orientationUnknown";
var kOrientationLandscape = "orientationLandscape";
var kOrientationPortrait = "orientationPortrait";
var kShowModeNormal = 0;
var kShowModeAutoplay = 1;
var kShowModeHyperlinksOnly = 2;
var kSoundTrackModePlayOnce = 0;
var kSoundTrackModeLooping = 1;
var kSoundTrackModeOff = 2;
var kOpacityPropertyName = "opacity";
var kVisibilityPropertyName = "visibility";
var kZIndexPropertyName = "z-index";
var kDisplayPropertyName = "display";
var kDisplayBlockPropertyValue = "block";
var kDisplayNonePropertyValue = "none";
var kTransformOriginTopLeftPropertyValue = "top left";
var kTransformOriginCenterPropertyValue = "center";
var kTransformStylePreserve3DPropertyValue = "preserve-3d";
var kTransformStyleFlatPropertyValue = "flat";
var kPositionAbsolutePropertyValue = "absolute";
var kPositionRelativePropertyValue = "relative";
var kBackfaceVisibilityHiddenPropertyValue = "hidden";
var kMaxSceneDownloadWaitTime = 60000;
var kMaxScriptDownloadWaitTime = 60000;
var kWaitingIndicatorFadeOutDuration = 2000;
var kHideAddressBarDelay = 3000;
var kSceneLoadPollInterval = 100;
var kSceneLoadDisplaySpinnerTime = 3000;
var kSceneLoadDisplaySpinnerPollCount =
	kSceneLoadDisplaySpinnerTime / kSceneLoadPollInterval;
var kSceneLoadGiveUpTime = 60000;
var kSceneLoadGiveUpPollCount = kSceneLoadGiveUpTime / kSceneLoadPollInterval;
var kPropertyName_currentSlide = "currentSlide";
var kKeyCode_Plus = 107;
var kKeyCode_Minus = 109;
var kKeyCode_Dot = 110;
var kKeyCode_F11 = 122;
var kKeyCode_F12 = 123;
var kKeyCode_Hyphen = 189;
var kKeyCode_Equal = 187;
var kKeyCode_Period = 190;
var kKeyCode_Slash = 191;
var kKeyCode_Space = 32;
var kKeyCode_Escape = 27;
var kKeyCode_LeftArrow = 37;
var kKeyCode_UpArrow = 38;
var kKeyCode_RightArrow = 39;
var kKeyCode_DownArrow = 40;
var kKeyCode_OpenBracket = 219;
var kKeyCode_CloseBracket = 221;
var kKeyCode_Home = 36;
var kKeyCode_End = 35;
var kKeyCode_PageUp = 33;
var kKeyCode_PageDown = 34;
var kKeyCode_Return = 13;
var kKeyCode_N = 78;
var kKeyCode_P = 80;
var kKeyCode_Q = 81;
var kKeyCode_S = 83;
var kKeyCode_Delete = 8;
var kKeyCode_0 = 48;
var kKeyCode_9 = 57;
var kKeyCode_Numeric_0 = 96;
var kKeyCode_Numeric_9 = 105;
var kKeyModifier_Shift = 1000;
var kKeyModifier_Ctrl = 2000;
var kKeyModifier_Alt = 3000;
var kKeyModifier_Meta = 4000;
var kHelpPlacardMainTitle = CoreDocs.loc(
	"Keyboard Shortcuts",
	"Keyboard Shortcuts"
);
var kHelpPlacardNavigationTitle = CoreDocs.loc("Navigation", "Navigation");
var kHelpPlacardOtherTitle = CoreDocs.loc("Other", "Other");
var kHelpPlacardAdvanceToNextBuild = CoreDocs.loc(
	"Advance to next build",
	"Advance to next build"
);
var kHelpPlacardGoBackToPreviousBuild = CoreDocs.loc(
	"Go back to previous build",
	"Go back to previous build"
);
var kHelpPlacardAdvanceAndSkipBuild = CoreDocs.loc(
	"Advance and skip build",
	"Advance and skip build"
);
var kHelpPlacardAdvanceToNextSlide = CoreDocs.loc(
	"Advance to next slide",
	"Advance to next slide"
);
var kHelpPlacardGoBackToPreviousSlide = CoreDocs.loc(
	"Go back to previous slide",
	"Go back to previous slide"
);
var kHelpPlacardGoToFirstSlide = CoreDocs.loc(
	"Go to first slide",
	"Go to first slide"
);
var kHelpPlacardGoToLastSlide = CoreDocs.loc(
	"Go to last slide",
	"Go to last slide"
);
var kHelpPlacardQuitPresentationMode = CoreDocs.loc(
	"Quit presentation mode",
	"Quit presentation mode"
);
var kHelpPlacardGoToSpecificSlide = CoreDocs.loc(
	"Go to specific slide",
	"Go to specific slide"
);
var kHelpPlacardShowOrHideKeyboardShortcuts = CoreDocs.loc(
	"Show or hide Keyboard Shortcuts",
	"Show or hide Keyboard Shortcuts"
);
var kHelpPlacardShowOrHideTheCurrentSlideNumber = CoreDocs.loc(
	"Show or hide the current slide number",
	"Show or hide the current slide number"
);
var kUnableToReachiWorkTryAgain = CoreDocs.loc(
	"Slide couldn't be displayed.\nDo you want to try again?",
	"alert text to display when we timeout trying to download resources from iWork.com"
);
var kSlideLabel = CoreDocs.loc("Slide", "Prefix label for 'Slide I/N' display");
var kTapOrSwipeToAdvance = CoreDocs.loc(
	"Tap or Swipe to advance",
	"Help string for bottom of portrait mode on mobile device"
);
var gShowController = null;
var browserPrefix, browserVersion;
var userAgentString = window.navigator.userAgent;
var isMacOS = window.navigator.platform.indexOf("Mac") !== -1;
var isChrome = false;
var isEdge = false;
var isIE = false;
if (userAgentString.lastIndexOf("Edge/") > 0) {
	isEdge = true;
	browserPrefix = "webkit";
	browserVersion = 12;
} else {
	if (userAgentString.lastIndexOf("Trident/") > 0) {
		isIE = true;
		browserPrefix = "ms";
		var revisionStringIE = userAgentString.substring(
			userAgentString.lastIndexOf("rv"),
			userAgentString.lastIndexOf(")")
		);
		var revisionIE = [];
		if (revisionStringIE.lastIndexOf(":") > 0) {
			revisionIE = revisionStringIE.split(":");
			browserVersion = parseFloat(revisionIE[1]);
		} else {
			if (revisionStringIE.lastIndexOf(" ") > 0) {
				revisionIE = revisionStringIE.split(" ");
				browserVersion = parseFloat(revisionIE[1]);
			} else {
				browserVersion = 11;
			}
		}
	} else {
		if (Prototype.Browser.WebKit) {
			browserPrefix = "webkit";
			if (userAgentString.lastIndexOf("Chrome/") > 0) {
				isChrome = true;
			}
		} else {
			if (Prototype.Browser.Gecko) {
				browserPrefix = "moz";
			} else {
				if (Prototype.Browser.IE) {
					isIE = true;
					browserPrefix = "ms";
					browserVersion = parseFloat(navigator.appVersion.split("MSIE")[1]);
				}
			}
		}
	}
}
var kKeyframesPropertyName = "@-" + browserPrefix + "-keyframes";
var kAnimationNamePropertyName = "-" + browserPrefix + "-animation-name";
var kAnimationDurationPropertyName =
	"-" + browserPrefix + "-animation-duration";
var kAnimationDelayPropertyName = "-" + browserPrefix + "-animation-delay";
var kAnimationFillModePropertyName =
	"-" + browserPrefix + "-animation-fill-mode";
var kAnimationTimingFunctionPropertyName =
	"-" + browserPrefix + "-animation-timing-function";
var kAnimationIterationCountPropertyName =
	"-" + browserPrefix + "-animation-iteration-count";
var kTransformPropertyName = "-" + browserPrefix + "-transform";
var kTransformOriginPropertyName = "-" + browserPrefix + "-transform-origin";
var kTransformOriginZPropertyName = "-" + browserPrefix + "-transform-origin-z";
var kTransitionPropertyName = "-" + browserPrefix + "-transition-property";
var kTransitionDurationName = "-" + browserPrefix + "-transition-duration";
var kTransformStylePropertyName = "-" + browserPrefix + "-transform-style";
var kTransitionPropertyName = "-" + browserPrefix + "-transition";
var kTransitionEndEventName = browserPrefix + "TransitionEnd";
var kAnimationEndEventName = browserPrefix + "AnimationEnd";
var kPerspectivePropertyName = "-" + browserPrefix + "-perspective";
var kPerspectiveOriginPropertyName =
	"-" + browserPrefix + "-perspective-origin";
var kBackfaceVisibilityPropertyName =
	"-" + browserPrefix + "-backface-visibility";
var kBoxShadowPropertyName = "-" + browserPrefix + "-box-shadow";
var kBorderPropertyName = "border";
var kBackgroundImagePropertyName = "background-image";
var kEmphasisEffects = [
	"apple:action-pop",
	"apple:action-pulse",
	"apple:action-blink",
	"apple:action-flip",
	"apple:action-bounce",
	"apple:action-jiggle",
];
var kActionBuildKeyAnimations = {
	"apple:action-opacity": ["opacity"],
	"apple:action-motion-path": ["position"],
	"apple:action-rotation": ["transform.rotation.z"],
	"apple:action-scale": [
		"transform.scale.x",
		"transform.scale.y",
		"anchorPoint",
		"contents",
		"bounds",
	],
	"apple:action-blink": ["opacity"],
	"apple:action-bounce": [
		"anchorPoint",
		"transform.scale.y",
		"transform.translation.y",
		"transform.scale.x",
	],
	"apple:action-flip": ["transform.rotation.y", "transform.scale.xy"],
	"apple:action-jiggle": ["transform.rotation.z"],
	"apple:action-pop": ["transform.scale.xy"],
	"apple:action-pulse": ["transform.scale.xy"],
};
var kSupportedWebGLEffects = [
	"apple:wipe-iris",
	"com.apple.iWork.Keynote.BUKAnvil",
	"com.apple.iWork.Keynote.BUKTwist",
	"com.apple.iWork.Keynote.BUKFlop",
	"com.apple.iWork.Keynote.KLNColorPlanes",
	"com.apple.iWork.Keynote.KLNFlame",
	"com.apple.iWork.Keynote.KLNConfetti",
	"com.apple.iWork.Keynote.KLNDiffuse",
	"com.apple.iWork.Keynote.KNFireworks",
	"com.apple.iWork.Keynote.KLNShimmer",
	"com.apple.iWork.Keynote.KLNSparkle",
	"apple:magic-move-implied-motion-path",
	"apple:ca-text-shimmer",
	"apple:ca-text-sparkle",
];
var useWebGL = true;
var usePDF = true;
var pdfScaleFactor = 1;
var kFullscreenChangeEventName = browserPrefix + "fullscreenchange";
window.addEventListener("load", setupShowController, false);
function static_url(a) {
	return a;
}
function setupShowController() {
	gShowController = new ShowController();
	gShowController.displayManager.showWaitingIndicator();
	gShowController.delegate.setPlaybackReadyHandler(function () {
		if (usePDF) {
			if (window.location.protocol === "file:") {
				PDFJS.disableWorker = true;
			}
			PDFJS.workerSrc = "./pdfjs/pdf_worker.js";
			PDFJS.cMapUrl = "./pdfjs/web/cmaps/";
			PDFJS.cMapPacked = true;
			var a = document.createElement("canvas");
			var b = a.getContext("webgl") || a.getContext("experimental-webgl");
			if (!b) {
				useWebGL = false;
			}
		}
		gShowController.startShow();
	});
}
function extractDelegateFromUrlParameter() {
	var d = getUrlParameter("delegate");
	var a;
	if (d == "" || d == null || typeof d == "undefined") {
		a = new NullDelegate();
	} else {
		var c = d.indexOf(".");
		a = window;
		while (c != -1) {
			var b = d.substring(0, c);
			a = a[b];
			d = d.substring(c + 1);
			c = d.indexOf(".");
		}
		a = a[d];
	}
	return a;
}
var NullDelegate = Class.create({
	initialize: function () {},
	showDidLoad: function () {},
	showExited: function () {
		history.go(-1);
	},
	propertyChanged: function (b, a) {},
	setPlaybackReadyHandler: function (a) {
		a();
	},
});
