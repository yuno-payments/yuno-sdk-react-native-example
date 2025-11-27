#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "YunoSDKExample-Swift.h"

@implementation AppDelegate {
  RCTBridge *_bridge;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize the React Native bridge but don't show it yet
  _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  
  // Create window
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  
  // Start with MainViewController (native screen)
  MainViewController *mainViewController = [[MainViewController alloc] init];
  UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:mainViewController];
  navigationController.navigationBarHidden = YES;
  
  self.window.rootViewController = navigationController;
  [self.window makeKeyAndVisible];
  
  return YES;
}

- (void)navigateToReactNativeWithCountryCode:(NSString *)countryCode configJson:(NSString *)configJson
{
  // Create React Native root view with initial props
  NSDictionary *initialProps = @{
    @"countryCode": countryCode,
    @"configJson": configJson
  };
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge
                                                    moduleName:@"YunoSDKExample"
                                             initialProperties:initialProps];
  
  rootView.backgroundColor = [UIColor whiteColor];
  
  // Create a UIViewController to host the React Native view
  UIViewController *reactViewController = [[UIViewController alloc] init];
  reactViewController.view = rootView;
  
  // Navigate to React Native
  UINavigationController *navController = (UINavigationController *)self.window.rootViewController;
  [navController pushViewController:reactViewController animated:YES];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
