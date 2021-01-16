import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BlobServiceClient } from '@azure/storage-blob';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// tslint:disable-next-line: only-arrow-functions
const getGlobalWindow = function () {
	return window;
};
@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	@ViewChild('fileInput', { static: false })
	fileInput: ElementRef<HTMLInputElement>;
	filesToUpload: Array<any> = [];

	sasToken = {
		token: '',
		expirationTime: undefined,
		connectionStringStorage: '',
	};

	// Your local Azure function URL
	webApiUrl = 'http://localhost:7071/api/';
	httpHeaders = new HttpHeaders({
		'Content-Type': 'application/json',
	});

	transformName = 'test-adbf';
	videosUploaded = [];
	loadingVideos = false;

	constructor(private http: HttpClient) {}

	ngOnInit() {
		this.updateListVideo();
	}

	async updateListVideo() {
		this.loadingVideos = true;
		await this.getVideos();

		// this.videosUploaded.forEach((video) => {
		// 	this.getJobState(video);
		// });

		this.videosUploaded.forEach((video) => {
			this.getStreamingLocatorUrls({
				streamingLocatorName: video.streamingLocatorName,
			}).then((urls) => {
				if (urls[2]) {
					video.manifestUrl = urls[2];
				}

				setTimeout(() => {
					this.updateMsPlayer(video);
				}, 800);
			});
		});

		this.loadingVideos = false;
	}

	onSelected(files: FileList): void {
		// tslint:disable-next-line: no-unused-expression
		this.fileInput.nativeElement.value === '';

		if (files.length > 0) {
			this.filesToUpload = [];

			Array.from(files).forEach((currentFile) => {
				this.filesToUpload.push({
					file: currentFile,
					name: currentFile.name.split('.')[0],
					progress: '0%',
					extension: currentFile.name.split('.').pop(),
					inputAssetResourceId: '',
					inputAssetSASUrl: '',
					inputAssetStorageId: '',
					inputAssetName: '',
					outputAssetResourceId: '',
					outputAssetName: '',
					outputAssetStorageId: '',
					jobResourceId: '',
					jobName: '',
					streamingLocatorResourceId: '',
					streamingLocatorName: '',
					streamingLocatorId: '',
					saved: false,
				});
			});
		}
	}

	// tslint:disable-next-line: typedef
	async process() {
		if (this.filesToUpload.length > 0) {
			this.filesToUpload.forEach(async (file) => {
				await this.createInputsAssets(file);
				await this.upload(file);
				await this.createOuputAsssets(file);
				await this.submitJob(file);
				await this.createStreamingLocator(file);
				await this.saveVideo(file);
				// in order to get the Urls you need wait the job done
				// await this.getStreamingLocatorUrls(file);
			});
		}
	}

	async createInputsAssets(file) {
		await this.http
			.post(
				`${this.webApiUrl}create-input-asset`,
				{
					name: file.name.replaceAll(' ', '-'),
				},
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				file.inputAssetResourceId = response.asset.id;
				file.inputAssetName = response.asset.name;
				file.inputAssetStorageId = 'asset-' + response.asset.assetId;
				file.inputAssetSASUrl = response.assetSASUrl;
			});
	}

	async createOuputAsssets(file) {
		await this.http
			.post(
				`${this.webApiUrl}create-output-asset`,
				{
					name: file.inputAssetName.replaceAll('input', 'output'), // we use the same to be consistent
				},
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				file.outputAssetResourceId = response.id;
				file.outputAssetName = response.name;
				file.outputAssetStorageId = 'asset-' + response.assetId;
			});
	}

	async submitJob(file) {
		await this.http
			.post(
				`${this.webApiUrl}submit-job`,
				{
					transformName: this.transformName, // previously created
					inputAssetName: file.inputAssetName,
					outputAssetName: file.outputAssetName, // we use the same to be consistent
				},
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				file.jobResourceId = response.id;
				file.jobName = response.name;
			});
	}

	async createStreamingLocator(file) {
		await this.http
			.post(
				`${this.webApiUrl}create-stream-locator`,
				{
					streamingPolicyName: 'Predefined_ClearStreamingOnly',
					outputAssetName: file.outputAssetName, // we use the same to be consistent
				},
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				file.streamingLocatorResourceId = response.id;
				file.streamingLocatorName = response.name;
				file.streamingLocatorId = response.streamingLocatorId;
			});
	}

	// in order to get the Url you need wait the job done
	async getStreamingLocatorUrls(file) {
		const urls = await this.http
			.get(
				`${this.webApiUrl}get-stream-locator-urls?streamingLocatorName=${file.streamingLocatorName}`,
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				return response;
			});

		return urls;
	}

	async saveVideo(file) {
		await this.http
			.post(
				`${this.webApiUrl}save-video`,
				{
					jobName: file.jobName,
					transformName: this.transformName,
					streamingLocatorName: file.streamingLocatorName,
					name: file.inputAssetName,
				},
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				file.saved = true;
			});
	}

	async getVideos() {
		await this.http
			.get(`${this.webApiUrl}get-videos`, {
				headers: this.httpHeaders,
				observe: 'body',
				responseType: 'json',
			})
			.toPromise()
			.then((response: any) => {
				this.videosUploaded = response.videos;

				this.videosUploaded.forEach((video) => {
					video.timestamp = new Date(video.timestamp).getTime();
				});

				// tslint:disable-next-line: only-arrow-functions
				this.videosUploaded = this.videosUploaded.sort(function (a, b) {
					return b.timestamp - a.timestamp;
				});
			});
	}

	getJobState(video) {
		this.http
			.get(
				`${this.webApiUrl}get-job-state?transformName=${this.transformName}&jobName=${video.jobName}`,
				{
					headers: this.httpHeaders,
					observe: 'body',
					responseType: 'json',
				}
			)
			.toPromise()
			.then((response: any) => {
				// tslint:disable-next-line: triple-equals
				if (response.state == 'Finished') {
					video.jobDone = true;

					this.getStreamingLocatorUrls({
						streamingLocatorName: video.streamingLocatorName,
					}).then((urls) => {
						if (urls[2]) {
							video.manifestUrl = urls[2];
						}

						setTimeout(() => {
							this.updateMsPlayer(video);
						}, 800);
					});
				}
			});
	}

	updateMsPlayer(video) {
		// const videoHtml = `<video id="${video.rowKey}" class="azuremediaplayer amp-default-skin">
		// 	<source src="${video.manifestUrl}" type="application/vnd.ms-sstr+xml" />
		// 	<p class="amp-no-js">
		// 		To view this video please enable JavaScript, and consider upgrading to
		// 		a web browser that supports HTML5 video
		// 	</p>
		// </video>`;
		// document.querySelector('#container-' + video.rowKey).innerHTML = videoHtml;

		const window: any = getGlobalWindow();
		const myPlayer = window.amp(video.rowKey, {
			nativeControlsForTouch: false,
			autoplay: false,
			controls: true,
			width: 'auto',
			height: 'auto',
			poster: '',
		});
		myPlayer.src([
			{
				src: video.manifestUrl,
				type: 'application/vnd.ms-sstr+xml',
			},
		]);
	}

	// tslint:disable-next-line: typedef
	getContainerClientStorage(SASUri, containerName) {
		const blobServiceClient = new BlobServiceClient(SASUri);
		const containerClient = blobServiceClient.getContainerClient(containerName);
		return containerClient;
	}

	async upload(assetToUpload) {
		const containerClient = this.getContainerClientStorage(
			assetToUpload.inputAssetSASUrl.href,
			'' // we don't want to create a container only upload a file
		);

		try {
			const blockBlobClient = containerClient.getBlockBlobClient(
				assetToUpload.file.name
			);

			await blockBlobClient
				.uploadData(assetToUpload.file, {
					onProgress(progress) {
						const percentageUploaded = parseInt(
							(
								(progress.loadedBytes / assetToUpload.file.size) *
								100
							).toString(),
							10
						);
						assetToUpload.progress = percentageUploaded + '%';
					},
				})
				.then(
					(BlockBlobUploadHeaders) => {},
					(BlockBlobUploadHeaders) => {
						// Error uploading
					}
				);
		} catch (error) {
			console.error(error.message);
		}

		console.log(containerClient);
	}
}
