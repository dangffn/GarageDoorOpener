
sock_file = "/tmp/videocapture.sock"


running = True
while running:
    with open(sock_file, "rb", 0) as in_file:
        read = in_file.read()
        print("Received", len(read), "bytes")