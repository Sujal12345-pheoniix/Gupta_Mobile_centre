import 'dart:developer';

void logInfo(String message) {
  log('[INFO] $message');
}

void logError(String message, {Object? error}) {
  log('[ERROR] $message', error: error);
}