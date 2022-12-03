!INC Local Scripts.EAConstants-JScript
!INC EAScriptLib.JScript-CSV

var csvFile = "d:\\Models\\Test.csv";
var thePackage as EA.Package;
var CSV_DELIMITER = ",,,,,";
function main(){
	// Show the script output window
	Repository.EnsureOutputVisible( "Script" );

	Session.Output( "JScript-CSVImport..." );
	Session.Output( "=======================================" );
	// Get the currently selected package in the tree to work on
	thePackage = Repository.GetTreeSelectedPackage();

	CSVIImportFile(csvFile, true);
}

function OnRowImported(){
	Session.Output( "row begin..." );
	Session.Output( "Name:" + CSVIGetColumnValueByName("Name,c"));
	Session.Output( "Desc:" + CSVIGetColumnValueByName("Desc;b"));
	Session.Output( "Stereotype:" + CSVIGetColumnValueByName("Stereotype"));
	Session.Output( "row end." );

	// Create an element
	var element as EA.Element;
	element = thePackage.Elements.AddNew( CSVIGetColumnValueByName("Name,c"), "Class" );
	element.Notes = CSVIGetColumnValueByName("Desc;b");
	element.StereotypeEx = CSVIGetColumnValueByName("Stereotype");
	element.Update();
}

main();