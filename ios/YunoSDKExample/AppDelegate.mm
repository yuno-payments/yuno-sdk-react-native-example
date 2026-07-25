#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "YunoSDKExample-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Set up React Native module name and initial props
  self.moduleName = @"YunoSDKExample";
  self.initialProps = @{};
  
  // Let RCTAppDelegate initialize React Native (required for New Architecture)
  [super application:application didFinishLaunchingWithOptions:launchOptions];
  
  // Override window with native MainViewController as root
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  
  MainViewController *mainViewController = [[MainViewController alloc] init];
  UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:mainViewController];
  navigationController.navigationBarHidden = YES;
  
  self.window.rootViewController = navigationController;
  [self.window makeKeyAndVisible];
  
  return YES;
}

- (void)navigateToReactNativeWithCountryCode:(NSString *)countryCode configJson:(NSString *)configJson
{
  // Create initial props with the configuration
  NSDictionary *initialProps = @{
    @"countryCode": countryCode ?: @"",
    @"configJson": configJson ?: @""
  };
  
  // Create React Native root view using RCTAppDelegate's rootViewFactory
  UIView *rootView = [self.rootViewFactory viewWithModuleName:self.moduleName
                                            initialProperties:initialProps
                                                launchOptions:nil];
  
  if (rootView == nil) {
    NSLog(@"Error: Could not create React Native root view");
    return;
  }
  
  rootView.backgroundColor = [UIColor whiteColor];
  
  // Create a UIViewController to host the React Native view
  UIViewController *reactViewController = [[UIViewController alloc] init];
  reactViewController.view = rootView;
  
  // Navigate to React Native
  UINavigationController *navController = (UINavigationController *)self.window.rootViewController;
  [navController pushViewController:reactViewController animated:YES];
}

- (void)navigateToReactNativeWithInitialScreen:(NSString *)initialScreen
{
  // Used by demo flows that self-initialize the SDK from JS (e.g. VTEX preflight) —
  // no config JSON required
  NSDictionary *initialProps = @{
    @"initialScreen": initialScreen ?: @""
  };

  UIView *rootView = [self.rootViewFactory viewWithModuleName:self.moduleName
                                            initialProperties:initialProps
                                                launchOptions:nil];

  if (rootView == nil) {
    NSLog(@"Error: Could not create React Native root view");
    return;
  }

  rootView.backgroundColor = [UIColor whiteColor];

  UIViewController *reactViewController = [[UIViewController alloc] init];
  reactViewController.view = rootView;

  UINavigationController *navController = (UINavigationController *)self.window.rootViewController;
  [navController pushViewController:reactViewController animated:YES];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
