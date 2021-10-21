import { AlFileDownloadService } from "./al-file-download-service";

describe('AlFileDownloadServiceTest Suite', () => {
    let service: AlFileDownloadService = new AlFileDownloadService();
    // Check the init variables
    describe('WHEN the service is initialized', () => {
        let generatedFile = "";
        let htmlMock:HTMLElement = {
            style: {
                visibility: ""
            },
            setAttribute: (attribute:string, value:any) => {
                if (attribute === "download") {
                    generatedFile = value;
                }
            },
            click: () => {
                // Do nothing is a mock.
            }
        } as HTMLElement;
        beforeEach(() => {
            global.URL.createObjectURL = jest.fn();
            jest.spyOn(document.body,"appendChild").mockReturnValue(null);
            jest.spyOn(document.body,"removeChild").mockReturnValue(null);
            jest.spyOn(document,"createElement").mockReturnValue(htmlMock);
            jest.spyOn(htmlMock,"click");
        });
        it('SHOULD download the file autoclicking a hidden link', () => {
            service.downloadFile("myCSVFile.csv","My,Data,In,The,File");
            expect(htmlMock.style.visibility).toBe("hidden");
            expect(generatedFile).toBe("myCSVFile.csv");
            expect(htmlMock.click).toHaveBeenCalled();
        });
    });
});
