 source ~/.zshrc
 source ~/.bash_profile
 gcloud auth login
 gcloud config set project myple-15ea9
 gcloud builds submit --config gcp_cloud_build.yaml .