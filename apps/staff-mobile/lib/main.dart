import 'package:flutter/material.dart';

void main() {
  runApp(const GuptaMobileApp());
}

class GuptaMobileApp extends StatelessWidget {
  const GuptaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gupta Mobile Centre',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Gupta Mobile Centre'),
      ),
    );
  }
}