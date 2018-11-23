import UIKit
import WebKit


class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    var webView: WKWebView?
    var configure: WKWebViewConfiguration?

    override func viewDidLoad() {
        super.viewDidLoad()

        self.configure = WKWebViewConfiguration()
        
        self.configure?.preferences = WKPreferences()
        self.configure?.preferences.javaScriptEnabled = true

        self.webView = WKWebView(frame: self.view.bounds, configuration: self.configure!)
        self.view.addSubview(webView!)

        self.webView?.navigationDelegate = self
        self.webView?.uiDelegate = self
        
    }

    override func viewWillAppear(_ animated: Bool) {
        print("viewWillAppear")
        super.viewWillAppear(animated)
        self.webView?.loadResource(string: "index")
    }

    override func didReceiveMemoryWarning() {
        print("didReceiveMemoryWarning")
        super.didReceiveMemoryWarning()
    }
    
    func fetchUrlParam(url: String, param: String) -> String? {
        let stringRegex = String.init(format: "(^|&|\\?)+%@=+([^&]*)(&|$)", param)
        do{
            let regex = try NSRegularExpression.init(pattern: stringRegex, options: .caseInsensitive)
            let matches = regex.matches(in: url, options: NSRegularExpression.MatchingOptions(rawValue: 0), range: NSMakeRange(0, url.count))
            for match: NSTextCheckingResult in matches {
                let string = url.substring(with: Range.init(match.range(at: 2), in: url)!)
                return string
            }
        }catch{

        }

        return nil
    }
    
    func postMessage(handle: String){
        //postMessage('Object.data')我想回传一个对象数据怎么写？看到了请补充一下。
        webView?.evaluateJavaScript("Briage.postMessage('\(handle)')") { (res: Any, error: Any) in
            print(res, error, 3)
        }
        //初始化数据
        webView?.evaluateJavaScript("Briage._init_('_init_config_data_')") { (res: Any, error: Any) in
            print(res, error, 3)
        }
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url?.absoluteString  {
            print(url)
            if url.hasPrefix("lagou://") == true {
                let handle = fetchUrlParam(url: url, param: "handle")
                webView.evaluateJavaScript("Briage.getParam("+handle!+")") { (result: Any, err) in
                    //result 是后端使用的参数，处理完了将数据回传H5
                    self.postMessage(handle:handle!)
                }
            }
        }
        decisionHandler(WKNavigationActionPolicy.allow)
    }

    func webViewDidStartLoad(webView: WKWebView) {
        print("webViewDidStartLoad")
        
    }
}

extension WKWebView {
    func loadUrl(string: String) {
        if let url = URL(string: string) {
            load(URLRequest(url: url))
        }
    }

    func loadResource(string: String) {
        let url = Bundle.main.url(forResource: string, withExtension: "html")!
        let request: NSURLRequest = NSURLRequest(url: url as URL)

        load(request as URLRequest);
    }
}
