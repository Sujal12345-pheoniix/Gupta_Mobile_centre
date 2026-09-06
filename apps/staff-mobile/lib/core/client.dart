import 'dart:async';
import 'package:http/http.dart' as http;

class ApiClient {
  final String baseUrl;
  final http.Client _client;

  ApiClient({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  Future<http.Response> get(String path, {Map<String, String>? headers}) async {
    final uri = Uri.parse('$baseUrl$path');
    return _client.get(uri, headers: headers);
  }

  Future<http.Response> post(String path, {Map<String, String>? headers, dynamic body}) async {
    final uri = Uri.parse('$baseUrl$path');
    return _client.post(uri, headers: headers, body: body);
  }
}