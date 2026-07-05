#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>

@interface AppDelegate : RCTAppDelegate

- (void)navigateToReactNativeWithCountryCode:(NSString *)countryCode configJson:(NSString *)configJson NS_SWIFT_NAME(navigateToReactNative(withCountryCode:configJson:));

- (void)navigateToReactNativeWithInitialScreen:(NSString *)initialScreen NS_SWIFT_NAME(navigateToReactNative(withInitialScreen:));

@end
