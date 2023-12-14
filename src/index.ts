import express from "express";
import multer from "multer";
import cors from "cors";

type FileId = string;
type DdanScanStatus = "scanning" | "done" | "error";
type DdanScanResult = "clean" | "infected" | "unknown";
type DdanScanResponse = {
  fileId: FileId;
  status: DdanScanStatus;
  result: DdanScanResult;
};

const FILE_SIZE_LIMIT = 100000000; // 100MB
const DONE_RATE = 0.5;
const ERROR_RATE = 0.1;
const INFECTION_RATE = 0.15;

// The Post Scan function sends a file with a Post request to the Ddan server.
// The Ddan server responds with a DdanScanResponse object.
// The DdanScanResponse object contains the status of the scan and the result of the scan.

const startMockDdanServer = async () => {
  const expressApp = express();
  const upload = multer({ storage: multer.memoryStorage() });

  expressApp.use(cors());

  const scanResponses: { [id: string]: DdanScanResponse } = {};

  expressApp.post("/scan", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file were uploaded.");
    }

    if (req.file.size === 0) {
      return res.status(400).send("Empty file.");
    }

    if (req.file.size > FILE_SIZE_LIMIT) {
      return res
        .status(400)
        .send(`File too big: ${req.file.size} bytes. Max size: ${FILE_SIZE_LIMIT} bytes.`);
    }

    const fileId = req.file.originalname;

    const newScanResponse: DdanScanResponse = {
      fileId,
      status: "scanning",
      result: "unknown",
    };

    scanResponses[fileId] = newScanResponse;

    console.log(
      `Received file '${fileId}' with size ${
        req.file.size
      } bytes.\nStarting scan...\n${JSON.stringify(newScanResponse, null, 2)}`
    );

    return res.status(200).send(newScanResponse);
  });

  expressApp.get("/result/:fileId", (req, res) => {
    // Gets the result of a scanned file by its id.
    // response: DdanScanResponse

    const fileId = req.params.fileId;
    const scanResponse = scanResponses[fileId];

    console.log(`Request for Deep Discovery Analyzer scan results of '${fileId}'`);

    if (!scanResponse) {
      console.log(`'${fileId}': not found`);
      return res.status(404).send("Not found");
    }

    if (scanResponse.status !== "scanning") {
      // either done or error
      console.log(
        `'${fileId}': was previously completed\n${JSON.stringify(scanResponse, null, 2)}`
      );
      return res.status(200).send(scanResponse);
    }

    // mock scanning
    const random = Math.random();
    console.log(random);

    // 50% chance to be done
    if (random < DONE_RATE) {
      // we done
      scanResponse.status = "done";

      if (random < INFECTION_RATE) {
        scanResponse.result = "infected";
      } else {
        scanResponse.result = "clean";
      }
    } else if (random < DONE_RATE + ERROR_RATE) {
      // we error
      scanResponse.status = "error";
    }

    // update map
    scanResponses[fileId] = scanResponse;

    if (scanResponse.status !== "scanning") {
      // either done or error
      console.log(`'${fileId}': now completed`);
    } else {
      // else we still scanning
      console.log(`${fileId}': still scanning`);
    }

    console.log(`Returning scan results for '${fileId}'\n${JSON.stringify(scanResponse, null, 2)}`);
    return res.status(200).send(scanResponse);
  });

  expressApp.get("/result", (_, res) => {
    // not for real use
    // Gets the result of all scanned files.

    const scanResponseArray = Array.from(Object.values(scanResponses));

    return res.status(200).send(scanResponseArray);
  });

  expressApp.listen(3000, () => {
    console.log("Mock Ddan server listening on port 3000");
  });
};

startMockDdanServer();
