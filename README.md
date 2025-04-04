# Ctrl V project
Create Date: 2024-04

## Description
This project is a AI native Clipboard Manager.

## Features
- [x] Paste from anywhere
- [x] AI post processing your pasted content

## Structure
+-----------------------+       +-----------------------+       +-----------------------+
| 1. PasteBox (Input)   |------>| 2. Content Monitoring |------>| 3. Content Classifier |
|   (Ctrl+V / Drag &   |       |      Service          |       |                       |
|     Drop Interface)   |       |                       |       |                       |
+-----------------------+       +-----------------------+       +-----------------------+
^                                                                         |
|                                                                         |
+-------------------------------------------------------------------------+
|
v
+-----------------------+       +-----------------------+       +-----------------------+ 
|     (File Type)       |       |     (Folder Mgmt)     |       |     (File System)     |
+-----------------------+       +-----------------------+       +-----------------------+
|
v
+-----------------------+       +-----------------------+       +-----------------------+       +-----------------------+
| 4b. URL               |------>| 5b. URL Analyzer      |------>| 6b. Action Trigger    |------>| 7. Downloaded Media   |
|     (Web Address)     |       |     (Fetch & Parse)   |       |     (Image, Video)    |       |     (File System)     |
+-----------------------+       +-----------------------+       +-----------------------+       +-----------------------+
|
v
+-----------------------+       +-----------------------+       +-----------------------+
| 4c. Plain Text        |------>| 5c. Text Handler      |------>| 6c. Text Storage      |
|                       |       |     (Notebook Mgmt)   |       |     (Database/File)   |
+-----------------------+       +-----------------------+       +-----------------------+
|
v
+-----------------------+       +-----------------------+       +-----------------------+
| 4d. Image/Video/Audio |------>| 5d. Media Handler     |------>| (Future Processing)   |
|                       |       |     (Optional)        |       |                       |
+-----------------------+       +-----------------------+       +-----------------------+